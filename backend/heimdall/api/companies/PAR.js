import fetch from 'node-fetch';
import { slugify } from 'reedkalisz-shared/utils.js';
import { getISODate } from 'reedkalisz-shared/datetime.js';
import { Api } from '../base.js';

function parseStorage(item, colorCode) {
  const { imgs, amount, id, colors } = item;
  return {
    img: imgs,
    amount,
    api_color_code: colorCode,
    api_color_id: id,
    multicolored: false,
    color_first: colors[0] ?? null, // str
    color_second: colors[1] ?? null // str
  };
}

function parseMain(item, code, colorCode) {
  const name = item.name.split(',')[0].trim();
  const sizes = item.size.split('x').map(Number);
  const { desc, materials, price } = item;
  return {
    // only define fields that are both:
    // - different from defaults
    // - pertain to the PAR api (e.g. enabled, api_enabled will be defined later)
    name,
    code,
    slug: slugify([code, name], { key: true }),
    seo_title: name,
    seo_description: desc,
    description: desc,
    size_x: sizes.length > 0 ? sizes[0] : null,
    size_y: sizes.length > 1 ? sizes[1] : null,
    size_z: sizes.length > 2 ? sizes[2] : null,
    materials,
    price,
    storage: [parseStorage(item, colorCode)], // first color varitant
    gallery: []
  };
}

function parseCode(code) {
  // formats: 'XXXXXX', 'XXXXXX.XX', 'XXXXXX.XX.XX', ...?
  const [productCode, ...tail] = code.split('.');
  // TODO: for now colorCode includes the code for quality (e.g. '00.QII' for transparent color, second hand quality)
  const colorCode = tail.join('.'); // colorCode: '', 'XX', 'XX.XX'
  return { productCode, colorCode };
}

function parse(products, stocks) {
  products = products.products.map(item => item.product);
  stocks = stocks.products.map(item => item.product);
  const items = products.map($ => {
    const s = stocks.find(s => s.id == $.id);
    return {
      id: Number($.id),
      code: $.kod,
      name: $.nazwa,
      desc: $.opis,
      size: $.wymiary,
      materials: [$.material_wykonania, $.material_dodatkowy].filter(Boolean),
      colors: [$.kolor_podstawowy, $.kolor_dodatkowy].filter(Boolean),
      imgs: $.zdjecia.map(item => `https://www.par.com.pl${item.zdjecie}`),
      amount: Number(s.stan_magazynowy),
      price: Number(s.cena_po_rabacie)
    };
  });

  const parsed = [];
  for (let item of items) {
    const { productCode, colorCode } = parseCode(item.code);
    // first create main item (and first storage item), then add storage items
    const main = parsed.find(item => item.code == productCode);
    if (!main) parsed.push(parseMain(item, productCode, colorCode));
    else main.storage.push(parseStorage(item, colorCode));
  }
  return parsed;
}

export class PAR extends Api {
  async fetch({ env: { username, password } }) {
    const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    const options = { headers: { Authorization: auth } };
    const [resProducts, resStocks] = await Promise.all([
      fetch('https://www.par.com.pl/api/products.json', options),
      fetch('https://www.par.com.pl/api/stocks.json', options)
    ]);
    const products = await resProducts.json();
    const stocks = await resStocks.json();

    const items = parse(products, stocks);
    return { items, lastScan: getISODate() };
  }
}
