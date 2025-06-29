import fetch from 'node-fetch';
import { slugify } from 'reedkalisz-shared/utils.js';
import { getISODate } from 'reedkalisz-shared/datetime.js';
import { Api } from '../base.js';
import { parseSearchParams, parseFormData } from '../utils.js';
import { parseSize, parsePrice } from './EasyGifts.js';
import { parseItems } from '../common.js';

import { apiAgent } from 'reedkalisz-shared/ca/AXPOL.js';

function parseColor(color) {
  // 'color1' -> { first: 'color1', second: null }
  // 'color1, color2' -> { first: 'color1', second: 'color2' }
  // 'Color1, ' -> { first: 'color1', second: null }
  // 'Color1, Color2' -> { first: 'color1', second: 'color2' }
  // 'color1, color2, color2' -> { first: 'color1', second: 'color2' }
  if (!color) return { first: null, second: null };
  const colors = color.split(',').map(c => c.trim().toLowerCase());
  if (colors.length === 1) return { first: colors[0], second: null };
  if (colors.length > 1) return { first: colors[0], second: colors[1] }; // ignore the rest
}

function parseStock(stock, order, delivery) {
  const s = x => Number(x.replaceAll(' ', '')); // "1 000" -> 1000 / "0", "", undefined, null -> 0
  [stock, order, delivery] = [s(stock), s(order), s(delivery)];
  if (stock || order) {
    if (stock < order) return order;
    return stock;
  }
  if (!delivery) return 0; // "out of stock"
  return null; // "ask about stock"
}

export function parseCode(code) {
  // occurence of any symbol other than a letter or a number is the start of the color code
  // test.x -> { productCode: 'test', colorCode: '.x' }
  // test   -> { productCode: 'test', colorCode: '' }
  const match = code.match(/[^\w\d]/);
  const index = match ? match.index : code.length;
  const productCode = code.slice(0, index);
  const colorCode = code.slice(index);
  return { productCode, colorCode };
}

function parse(company, products) {
  const handlingCosts = company?.api_handling_costs ?? [];

  const items = products.map($ => {
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
      materials: $.MaterialPL?.split(',').map(m => m.trim()),
      price,
      handling_cost: handlingCosts.find(h => h.code === $.HandlingCost)?.price || null,
      _storage: {
        img: $.Foto,
        amount,
        api_color_code: colorCode,
        api_color_id: $.productId,
        color_first: colors.first, // str
        color_second: colors.second // str
      }
    };
  });

  return parseItems(items);
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
      'User-Agent': fakeBrowserAgent
    }
  };
  if (jwt) options.headers.Authorization = `Bearer ${jwt}`;
  if (formdata) options.body = parseFormData(formdata);
  if (apiAgent) options.agent = apiAgent; // use the custom https agent with the intermediate certificate

  const res = await fetch(`https://axpol.com.pl/api/b2b-api/${params}`, options);
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
  }
};

export class AXPOL extends Api {
  async fetch({ company, env: { username, password, key } }) {
    const date = '2000-01-01 00:00:00'; // arbitrary date far enough in the past for all requests

    // Login to the api and get the uid and jwt.
    const { uid, jwt } = (await endpoints.customerLogin(key, username, password)).data;

    // Get the product count.
    // const { count } = (await endpoints.productCount(key, uid, jwt, date)).data;
    // console.log(`   - count: ${count}`);
    const count = 100;

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
  }
}
