import fetch from 'node-fetch';
import { getISODate } from 'reedkalisz-shared/datetime.js';
import { slugify } from 'reedkalisz-shared/utils.js';
import { Api } from '../base.js';
import { addCategories, uniqueMaterials } from '../common.js';
import { TIMEOUT, timeout } from '../utils.js';

function parseCode(code) {
  // formats: 'XXXXXX', 'XXXXXX-XX', 'XXXXXX-XX-XX', ...?
  const [productCode, ...tail] = code.split('-'); // code: 'XXXXXX-XX'
  return { productCode, hasLongTail: tail.length > 1 };
}

function parseSize(size, unit) {
  // size: int, unit: str (e.g. 'mm', 'cm', 'm')
  // return size in mm
  size = Number(size);
  if (unit == 'mm') return size;
  if (unit == 'cm') return size * 10;
  if (unit == 'm') return size * 1000;
}

function parseColorDescription(colorDescription) {
  // color: str (e.g. 'White', 'Black', 'Red/Black')
  // return [color1, color2] - null if empty
  if (!colorDescription) return [null, null];
  const colors = colorDescription.split('/').map((c) => c.trim());
  if (colors.length === 1) {
    if (!colors[0]) return [null, null]; // ['']
    return [colors[0], null];
  } else if (colors.length === 2) {
    return colors;
  } else {
    console.log('Too many colors in MidOcean product, cutting excess...');
    return [colors[0], colors[1]];
  }
}

// each feed cut down to what `parse` reads as soon as it comes: the raw ones (the print data alone is 18 MB of JSON) are
// then let go one by one, not all held until the last one comes
const feeds = {
  'printpricelist/2.0': (printpricelist) => {
    const handlingCosts = printpricelist.print_manipulations.map((m) => ({
      price: Number(m.price.replace(',', '.')),
      code: m.code,
      name: m.description,
    }));
    handlingCosts.sort((a, b) => a.price - b.price); // sort by price, ascending
    return handlingCosts;
  },
  'pricelist/2.0': (pricelist) =>
    pricelist.price.map((p) => ({
      sku: p.sku,
      price: Number(p.price.replace(',', '.')),
    })),
  'printdata/1.0': (printdata) =>
    printdata.products.map((p) => ({
      productCode: p.master_code,
      manipulation: p.print_manipulation,
      positions: p.printing_positions.map((pos) => {
        const a = pos.max_print_size_height;
        const b = pos.max_print_size_width;
        const areaType = pos.print_position_type;
        // the sizes are the whole width and height, an ellipse's half-axes are half of them;
        // a polygon counts as its bounding box
        const area = areaType === 'Ellipse' ? Math.round((Math.PI * a * b) / 4) : a * b;
        return {
          techniques: pos.printing_techniques.map((t) => t.id),
          label: pos.position_id,
          height: a,
          width: b,
          area,
        };
      }),
    })),
  'products/2.0': (products) => products,
  'stock/2.0': (stock) =>
    stock.stock.map((s) => ({
      sku: s.sku,
      amount: Number(s.qty),
    })),
};

function parse(handlingCosts, pricelist, printdata, products, stock) {
  // looked up once per product / variant: a find per lookup blocks the socket server for seconds
  const priceByProduct = new Map(); // the first variant's price
  for (const p of pricelist) {
    const code = parseCode(p.sku).productCode; // TODO: are prices same for all variants (probably not for textiles)
    if (!priceByProduct.has(code)) priceByProduct.set(code, p.price);
  }
  const stockBySku = new Map(stock.map((s) => [s.sku, s.amount]));
  const printByCode = new Map(printdata.map((p) => [p.productCode, p]));

  const items = products.map(($) => {
    const { productCode } = parseCode($.master_code);

    const price = priceByProduct.get(productCode) || null;

    const handlingCostCode = printByCode.get(productCode)?.manipulation || null;
    const handling_cost = handlingCosts.find((h) => h.code === handlingCostCode)?.price || null;

    const description = $?.commercial_description || $?.long_description || $?.short_description || null;

    const data = {
      // only define fields that are both:
      // - different from defaults
      // - pertain to the MidOcean api (e.g. enabled will be defined later)
      name: $.product_name ?? '',
      code: productCode,
      slug: slugify([productCode, $.product_name], { key: true }),
      seo_title: $.product_name,
      seo_description: description,
      description,
      size_x: parseSize($.length, $.length_unit),
      size_y: parseSize($.width, $.width_unit),
      size_z: parseSize($.height, $.height_unit),
      materials: uniqueMaterials([$.material]),
      price,
      handling_cost,
      gallery: [], // TODO: $.digital_assets.filter(a => a.type === 'image').map(a => a.url)
      storage: $.variants.map((v) => {
        const { hasLongTail } = parseCode(v.sku);
        const vImages = v?.digital_assets ?? [];
        const vColor = parseColorDescription(v.color_description);
        const data = {
          img: vImages.filter((a) => a.type === 'image').map((a) => a.url),
          amount: stockBySku.get(v.sku) ?? null,
          api_color_code: v.sku, // the variant's whole code
          api_color_id: v.variant_id,
          multicolored: false,
          color_first: vColor[0],
          color_second: vColor[1],
        };

        if (hasLongTail) data._incompatible = true;
        return data;
      }),
      _labelings: printByCode.get(productCode)?.positions || [],
      // categories are set per variant
      _categories: addCategories(
        [],
        $.variants.map((v) => [v.category_level1, v.category_level2, v.category_level3]),
      ),
    };
    if (data.storage.every((s) => s?._incompatible)) data._incompatible = true;
    return data;
  });

  return { items, handlingCosts };
}

export class MidOcean extends Api {
  fetch = async ({ env: { token } }) => {
    const options = { headers: { 'x-Gateway-APIKey': token }, signal: timeout(TIMEOUT.feed) };
    const data = await Promise.all(
      Object.entries(feeds).map(async ([endpoint, cut]) => {
        const res = await fetch(`https://api.midocean.com/gateway/${endpoint}?language=pl`, options);
        return cut(await res.json());
      }),
    );

    const { items, handlingCosts } = parse(...data);
    return { items, handlingCosts, lastScan: getISODate() };
  };
}
