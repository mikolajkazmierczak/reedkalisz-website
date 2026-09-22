import fetch from 'node-fetch';
import { getISODate } from 'reedkalisz-shared/datetime.js';
import { slugify } from 'reedkalisz-shared/utils.js';
import { Api } from '../base.js';
import { parseItems } from '../common.js';
import { parseFormData, parseSearchParams } from '../utils.js';
import { parsePrice, parseSize } from './EasyGifts.js';

import { apiAgent } from 'reedkalisz-shared/ca/AXPOL.js';

function parseColor(color) {
  // 'color1' -> { first: 'color1', second: null }
  // 'color1, color2' -> { first: 'color1', second: 'color2' }
  // 'Color1, ' -> { first: 'color1', second: null }
  // 'Color1, Color2' -> { first: 'color1', second: 'color2' }
  // 'color1, color2, color2' -> { first: 'color1', second: 'color2' }
  if (!color) return { first: null, second: null };
  const colors = color.split(',').map((c) => c.trim().toLowerCase());
  if (colors.length === 1) return { first: colors[0], second: null };
  if (colors.length > 1) return { first: colors[0], second: colors[1] }; // ignore the rest
}

function parseStock(stock, order, delivery) {
  const s = (x) => Number(x.replaceAll(' ', '')); // "1 000" -> 1000 / "0", "", undefined, null -> 0
  [stock, order, delivery] = [s(stock), s(order), s(delivery)];
  if (stock || order) {
    if (stock < order) return order;
    return stock;
  }
  if (!delivery) return 0; // "out of stock"
  return null; // "ask about stock"
}

export function parseCode(code) {
  // AXPOL uses three schemes
  // the separator alone does not tell them apart
  // two of them start with a dot, so the segment count decides
  //
  // 'T9200.001.XL' -> { productCode: 'T9200',   colorCode: '.001.XL' } // apparel: colour + size
  // 'P437.3001'    -> { productCode: 'P437.30', colorCode: '.01' }     // 2-digit product, 2-digit colour
  // 'P322.081'     -> { productCode: 'P322.08', colorCode: '.1' }      // ...or 1-digit colour
  // 'V2329/A-03'   -> { productCode: 'V2329/A', colorCode: '-03' }     // '/A' is part of the product
  // 'V3452-08'     -> { productCode: 'V3452',   colorCode: '-08' }
  // 'V0001'        -> { productCode: 'V0001',   colorCode: '' }
  //
  // in the dot scheme the first two digits belong to the product and the rest is the color,
  // 1-digit colors have elided 2-digit codes (1 -> 01)
  // colors past 09 need the second digit, which is why the 4-digit form exists at all
  // (treating the whole suffix as color would merge every sub-product)
  //
  // ...what a mess

  const c = String(code || '').trim();
  if (!c) return null; // codeless rows
  const dot = c.indexOf('.');
  if (dot >= 0) {
    const segments = c.slice(dot + 1).split('.');
    if (segments.length > 1) return { productCode: c.slice(0, dot), colorCode: `.${segments.join('.')}` };
    if (/^\d{3,4}$/.test(segments[0])) {
      return { productCode: c.slice(0, dot + 3), colorCode: `.${segments[0].slice(2)}` };
    }
    return { productCode: c.slice(0, dot), colorCode: c.slice(dot) };
  }
  // last dash, not the first symbol, so a '/A' sub-variant stays in the product code
  const dash = c.lastIndexOf('-');
  if (dash > 0) return { productCode: c.slice(0, dash), colorCode: c.slice(dash) };
  return { productCode: c, colorCode: '' };
}

function parse(company, products) {
  const handlingCosts = company?.api_handling_costs ?? [];

  return parseItems(
    products
      // leftover header row and codeless banner rows
      .filter(($) => $.CodeERP && $.CodeERP !== 'symbol')
      .map(($) => {
        const { productCode, colorCode } = parseCode($.CodeERP);
        const name = $.TitlePL || '';
        const description = $.DescriptionPL || '';
        const size = parseSize($.Dimensions);
        const price = parsePrice(company, $.NetPricePLN, !$.Sale); // apply discount if the product is not on sale
        const amount = parseStock($.InStock, $.onOrder, $.nextDelivery);
        const colors = parseColor($.ColorPL);
        return {
          name,
          code: productCode,
          slug: slugify([productCode, name], { key: true }),
          seo_title: name,
          seo_description: description,
          description,
          size_x: size.x,
          size_y: size.y,
          size_z: size.z,
          materials: $.MaterialPL?.split(',').map((m) => m.trim()),
          price,
          handling_cost: handlingCosts.find((h) => h.code === $.HandlingCost)?.price || null,
          _storage: {
            img: $.Foto,
            amount,
            api_color_code: colorCode,
            api_color_id: $.productId,
            color_first: colors.first, // str
            color_second: colors.second, // str
          },
        };
      }),
  );
}

async function fetchApi(method, { jwt = null, searchparams = null, formdata = null } = {}) {
  // Call the api, while possibly attaching searchparams and/or formdata.
  const params = searchparams ? parseSearchParams(searchparams) : '';

  const fakeBrowserAgent =
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0. 2272.118 Safari/537.36';
  const options = {
    method,
    headers: {
      Accept: '*/*', // for some reason, the api works with this and not 'Content-Type'
      'User-Agent': fakeBrowserAgent,
    },
  };
  if (jwt) options.headers.Authorization = `Bearer ${jwt}`;
  if (formdata) options.body = parseFormData(formdata);
  if (apiAgent) options.agent = apiAgent; // use the custom https agent with the intermediate certificate

  const res = await fetch(`https://axpol.com/api/b2b-api/${params}`, options);
  return await res.json();
}

const endpoints = {
  // these methods are based on the Postman collection
  customerLogin: async (key, username, password) => {
    // returns { success: 0/1, data: { uid: '123', jwt: '123' } }
    const params = { 'params[username]': username, 'params[password]': password };
    return await fetchApi('POST', { formdata: { method: 'Customer.Login', key, ...params } });
  },
  productCount: async (key, uid, jwt, date) => {
    // returns { succes: 0/1, data: { count: '123' } }
    const params = { 'params[date]': date };
    return await fetchApi('GET', { jwt, searchparams: { method: 'Product.Count', key, uid, ...params } });
  },
  productList: async (key, uid, jwt, date, limit, offset) => {
    // returns { success: 0/1, data: { 'id1': {}, 'id2': {}, ... } }
    const params = { 'params[date]': date, 'params[limit]': limit, 'params[offset]': offset };
    return await fetchApi('GET', { jwt, searchparams: { method: 'Product.List', key, uid, ...params } });
  },
};

export class AXPOL extends Api {
  fetch = async ({ company, env: { username, password, key } }) => {
    const date = '2000-01-01 00:00:00'; // arbitrary date far enough in the past for all requests

    // Login to the api and get the uid and jwt.
    const { uid, jwt } = (await endpoints.customerLogin(key, username, password)).data;

    // Get the product count.
    const { count } = (await endpoints.productCount(key, uid, jwt, date)).data;
    console.log(`   - count: ${count}`);

    // Get the products, in chunks of 1000.
    const limit = 1000;
    const products = [];
    for (let offset = 0; offset < count; offset += limit) {
      console.log(`   - fetching: ${offset}-${offset + limit}/${count}`);
      const chunk = (await endpoints.productList(key, uid, jwt, date, limit, offset)).data;
      products.push(...Object.values(chunk));
    }

    const items = parse(company, products);
    return { items, lastScan: getISODate() };
  };
}
