import fetch from 'node-fetch';
import { slugify } from 'reedkalisz-shared/utils.js';
import { getISODate } from 'reedkalisz-shared/datetime.js';
import { Api } from '../base.js';

function parseCode(code) {
  // formats: 'XXXXXX', 'XXXXXX-XX', 'XXXXXX-XX-XX', ...?
  const [productCode, ...tail] = code.split('-'); // code: 'XXXXXX-XX'
  // TODO: for now colorCode includes the code for textile size (e.g. 'WH-XL' for white color, XL size)
  const colorCode = tail ? tail.join('-') : null; // colorCode: '', 'XX', 'XX-XX'
  return { productCode, colorCode, hasLongTail: tail.length > 1 };
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
  const colors = colorDescription.split('/').map(c => c.trim());
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

function parse(printpricelist, pricelist, printdata, products, stock) {
  pricelist = pricelist.price.map(p => ({
    sku: p.sku,
    price: Number(p.price.replace(',', '.'))
  }));
  printdata = printdata.products.map(p => ({
    productCode: p.master_code,
    manipulation: p.print_manipulation,
    positions: p.printing_positions.map(pos => {
      const a = pos.max_print_size_height;
      const b = pos.max_print_size_width;
      const areaType = pos.print_position_type;
      const area = areaType === 'Rectangle' ? a * b : areaType === 'Ellipse' ? Math.PI * a * b : null;
      return {
        techniques: pos.printing_techniques.map(t => t.id),
        label: pos.position_id,
        height: a,
        width: b,
        area
      };
    })
  }));
  stock = stock.stock.map(s => ({
    sku: s.sku,
    amount: Number(s.qty)
  }));

  const handlingCosts = printpricelist.print_manipulations.map(m => ({
    price: Number(m.price.replace(',', '.')),
    code: m.code,
    name: m.description
  }));
  handlingCosts.sort((a, b) => a.price - b.price); // sort by price, ascending

  const items = products.map($ => {
    const { productCode } = parseCode($.master_code);

    const price =
      pricelist.find(p => {
        return parseCode(p.sku).productCode === productCode; // TODO: are prices same for all variants (probably not for textiles)
      })?.price || null;

    const handlingCostCode = printdata.find(p => p.productCode === productCode)?.manipulation || null;
    const handling_cost = handlingCosts.find(h => h.code === handlingCostCode)?.price || null;

    const description = $?.commercial_description || $?.long_description || $?.short_description || null;

    const data = {
      // only define fields that are both:
      // - different from defaults
      // - pertain to the MidOcean api (e.g. enabled, api_enabled will be defined later)
      name: $.product_name ?? '',
      code: productCode,
      slug: slugify([productCode, $.product_name], { key: true }),
      seo_title: $.product_name,
      seo_description: description,
      description,
      size_x: parseSize($.length, $.length_unit),
      size_y: parseSize($.width, $.width_unit),
      size_z: parseSize($.height, $.height_unit),
      materials: [$.material],
      price,
      handling_cost,
      gallery: [], // TODO: $.digital_assets.filter(a => a.type === 'image').map(a => a.url)
      storage: $.variants.map(v => {
        const { colorCode, hasLongTail } = parseCode(v.sku);
        const vStock = stock.find(s => s.sku === v.sku);
        const vImages = v?.digital_assets ?? [];
        const vColor = parseColorDescription(v.color_description);
        const data = {
          img: vImages.filter(a => a.type === 'image').map(a => a.url),
          amount: vStock ? vStock.amount : null,
          api_color_code: colorCode,
          api_color_id: v.variant_id,
          multicolored: false,
          color_first: vColor[0],
          color_second: vColor[1]
        };
        console.log(data);

        if (hasLongTail) data._incompatible = true;
        return data;
      }),
      _labelings: printdata.find(p => p.productCode === productCode)?.positions || []
    };
    if (data.storage.every(s => s?._incompatible)) data._incompatible = true;
    return data;
  });

  return { items, handlingCosts };
}

export class MidOcean extends Api {
  async fetch({ env: { token } }) {
    const endpoints = ['printpricelist/2.0', 'pricelist/2.0', 'printdata/1.0', 'products/2.0', 'stock/2.0'];
    const responses = await Promise.all(
      endpoints.map(endpoint => {
        const url = endpoint => `https://api.midocean.com/gateway/${endpoint}?language=pl`;
        const options = { headers: { 'x-Gateway-APIKey': token } };
        return fetch(url(endpoint), options);
      })
    );
    const jsons = await Promise.all(responses.map(res => res.json()));

    const { items, handlingCosts } = parse(...jsons);
    return { items, handlingCosts, lastScan: getISODate() };
  }
}
