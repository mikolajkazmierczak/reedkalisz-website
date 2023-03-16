import fetch from 'node-fetch';
import { slugify } from 'reedkalisz-shared/utils.js';
import { ExternalAPI } from './base.js';

export class PARAPI extends ExternalAPI {
  parse(products, stocks) {
    function parseStorage(item, colorCode) {
      return {
        enabled: true,
        img: item.imgs,
        amount: item.amount,
        api_color_code: colorCode,
        api_color_id: item.id,
        color_first: item.colors[0] ?? null, // str
        color_second: item.colors[1] ?? null, // str
        multicolored: false
      };
    }
    function parseMain(item, code, colorCode) {
      const name = item.name.split(',')[0].trim();
      const sizes = item.size.split('x').map(Number);
      return {
        // only define fields that are both:
        // - different from defaults
        // - pertain to the PAR api (e.g. enabled, api_enabled will be defined later)
        name,
        code,
        slug: slugify([item.code, item.name], { key: true }),
        seo_title: item.name,
        seo_description: item.desc,
        description: item.desc,
        size_x: sizes.length > 0 ? sizes[0] : null,
        size_y: sizes.length > 1 ? sizes[1] : null,
        size_z: sizes.length > 2 ? sizes[2] : null,
        materials: item.materials,
        price: item.price,
        storage: [parseStorage(item, colorCode)], // first color varitant
        gallery: []
      };
    }

    products = products.products.map(item => item.product);
    stocks = stocks.products.map(item => item.product);
    const items = products.map(p => {
      const s = stocks.find(s => s.id == p.id);
      return {
        id: Number(p?.id) ?? null,
        code: p?.kod ?? '',
        name: p?.nazwa ?? '',
        desc: p?.opis ?? '',
        size: p?.wymiary ?? '',
        materials: [p?.material_wykonania, p?.material_dodatkowy].filter(Boolean),
        colors: [p?.kolor_podstawowy, p?.kolor_dodatkowy].filter(Boolean),
        imgs: p?.zdjecia.map(item => item.zdjecie) ?? [],
        amount: Number(s?.stan_magazynowy) ?? 0,
        price: Number(s?.cena_po_rabacie) ?? 0
      };
    });

    const parsed = [];
    for (let item of items) {
      try {
        // RXXXXX, RXXXXX.XX, RXXXXX.XX.X, ...?
        const [code, ...codeTail] = item.code.split('.'); // code: RXXXXX
        const colorCode = codeTail.join('.'); // colorCode: _, XX, XX.X

        const main = parsed.find(item => item.code == code);
        if (!main) parsed.push(parseMain(item, code, colorCode));
        else main.storage.push(parseStorage(item, colorCode));
      } catch (err) {
        parsed.push({ item: null, error: err });
      }
    }

    parsed.sort((a, b) => a.name.localeCompare(b.name));
    return parsed;
  }

  async fetch(username, password) {
    const options = {
      method: 'GET',
      headers: {
        Authorization: 'Basic ' + btoa(`${username}:${password}`)
      }
    };
    // const products = PAR;
    // const stocks = PARStocks;
    const resProducts = await fetch('https://www.par.com.pl/api/products.json', options);
    const products = await resProducts.json();
    const resStocks = await fetch('https://www.par.com.pl/api/stocks.json', options);
    const stocks = await resStocks.json();
    return this.parse(products, stocks);
  }
}
