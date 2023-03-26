import fetch from 'node-fetch';
import { slugify } from 'reedkalisz-shared/utils.js';
import { ExternalAPI } from './base.js';

export class PARAPI extends ExternalAPI {
  parse(products, stocks) {
    function parseStorage(item, colorCode) {
      const { imgs, amount, id, colors } = item;
      return {
        enabled: true,
        img: imgs,
        amount,
        api_color_code: colorCode,
        api_color_id: id,
        color_first: colors[0] ?? null, // str
        color_second: colors[1] ?? null, // str
        multicolored: false
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

    products = products.products.map(item => item.product);
    stocks = stocks.products.map(item => item.product);
    const items = products.map(p => {
      const s = stocks.find(s => s.id == p.id);
      return {
        id: Number(p.id),
        code: p.kod,
        name: p.nazwa,
        desc: p.opis,
        size: p.wymiary,
        materials: [p.material_wykonania, p.material_dodatkowy].filter(Boolean),
        colors: [p.kolor_podstawowy, p.kolor_dodatkowy].filter(Boolean),
        imgs: p.zdjecia.map(item => item.zdjecie),
        amount: Number(s.stan_magazynowy),
        price: Number(s.cena_po_rabacie)
      };
    });

    const parsed = [];
    for (let item of items) {
      // get code and colorCode (formats: 'RXXXXX', 'RXXXXX.XX', 'RXXXXX.XX.X', ...?)
      const [code, ...codeTail] = item.code.split('.'); // code: 'RXXXXX'
      const colorCode = codeTail.join('.'); // colorCode: '', 'XX', 'XX.X'
      // first create main item (and first storage item), then add storage items
      const main = parsed.find(item => item.code == code);
      if (!main) parsed.push(parseMain(item, code, colorCode));
      else main.storage.push(parseStorage(item, colorCode));
    }
    return parsed;
  }

  async fetch(username, password) {
    const options = { headers: { Authorization: 'Basic ' + btoa(`${username}:${password}`) } };
    const [resProducts, resStocks] = await Promise.all([
      fetch('https://www.par.com.pl/api/products.json', options),
      fetch('https://www.par.com.pl/api/stocks.json', options)
    ]);
    const products = await resProducts.json();
    const stocks = await resStocks.json();
    return this.parse(products, stocks);
  }
}
