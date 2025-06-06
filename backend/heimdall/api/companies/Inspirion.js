import fetch from 'node-fetch';
import { slugify } from 'reedkalisz-shared/utils.js';
import { getISODate } from 'reedkalisz-shared/datetime.js';
import { Api } from '../base.js';

function parse(products, pricelist, stock) {
  // pricelist = pricelist.price.map(p => ({
  //   sku: p.sku,
  //   price: Number(p.price.replace(',', '.'))
  // }));
  // printdata = printdata.products.map(p => ({
  //   productCode: p.master_code,
  //   manipulation: p.print_manipulation
  // }));
  // stock = stock.stock.map(s => ({
  //   sku: s.sku,
  //   amount: Number(s.qty)
  // }));
  // const handlingCosts = printpricelist.print_manipulations.map(m => ({
  //   price: Number(m.price.replace(',', '.')),
  //   code: m.code,
  //   name: m.description
  // }));
  // handlingCosts.sort((a, b) => a.price - b.price); // sort by price, ascending
  // const items = products.map($ => {
  //   const { productCode } = parseCode($.master_code);
  //   const price =
  //     pricelist.find(p => {
  //       return parseCode(p.sku).productCode === productCode; // TODO: are prices same for all variants (probably not for textiles)
  //     })?.price || null;
  //   const handlingCostCode =
  //     printdata.find(p => {
  //       return p.productCode === productCode;
  //     })?.manipulation || null;
  //   const handling_cost = handlingCosts.find(h => h.code === handlingCostCode)?.price || null;
  //   const description = $?.commercial_description || $?.long_description || $?.short_description || null;
  //   const data = {
  //     // only define fields that are both:
  //     // - different from defaults
  //     // - pertain to the MidOcean api (e.g. enabled, api_enabled will be defined later)
  //     name: $.product_name ?? '',
  //     code: productCode,
  //     slug: slugify([productCode, $.product_name], { key: true }),
  //     seo_title: $.product_name,
  //     seo_description: description,
  //     description,
  //     size_x: parseSize($.length, $.length_unit),
  //     size_y: parseSize($.width, $.width_unit),
  //     size_z: parseSize($.height, $.height_unit),
  //     materials: [$.material],
  //     price,
  //     handling_cost,
  //     gallery: [], // TODO: $.digital_assets.filter(a => a.type === 'image').map(a => a.url)
  //     storage: $.variants.map(v => {
  //       const { colorCode, hasLongTail } = parseCode(v.sku);
  //       const vStock = stock.find(s => s.sku === v.sku);
  //       const vImages = v?.digital_assets ?? [];
  //       const vColor = parseColorDescription(v.color_description);
  //       const data = {
  //         img: vImages.filter(a => a.type === 'image').map(a => a.url),
  //         amount: vStock ? vStock.amount : null,
  //         api_color_code: colorCode,
  //         api_color_id: v.variant_id,
  //         multicolored: false,
  //         color_first: vColor[0],
  //         color_second: vColor[1]
  //       };
  //       console.log(data);
  //       if (hasLongTail) data._incompatible = true;
  //       return data;
  //     })
  //   };
  //   if (data.storage.every(s => s?._incompatible)) data._incompatible = true;
  //   return data;
  // });
  // return { items, handlingCosts };
}

export class Inspirion extends Api {
  async fetch({ env: { token } }) {
    const baseUrl = 'https://leoapi.inspirion.eu/api/v1/';
    const options = { headers: { 'X-Gateway-API-Key': token } };

    const fetchUrl = async (endpoint, paramsObject = null) => {
      const params = paramsObject ? '&' + new URLSearchParams(paramsObject) : '';
      const url = `${baseUrl}${endpoint}?language=pl${params}`;
      const res = await fetch(url, options);
      return res.json();
    };

    const fetchPaged = async (endpoint, limit = 500) => {
      let lastPage = Infinity; // true value determined after first request
      const items = [];
      for (let page = 1; page <= lastPage; page += 1) {
        console.log(`   - fetching /${endpoint}: page ${page}/${lastPage === Infinity ? '?' : lastPage} (${limit})`);
        const { data: chunk, last_page } = await fetchUrl(endpoint, { page, perPage: limit });
        if (lastPage === Infinity) lastPage = last_page;
        items.push(...chunk);
      }
      return items;
    };

    const products = await fetchPaged('products');
    const pricelist = await fetchPaged('pricelist');
    const stock = await fetchUrl('stock');
    const items = parse(company, products, pricelist, stock);
    return { items, lastScan: getISODate() };
  }
}
