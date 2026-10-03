import fetch from 'node-fetch';
import { getISODate } from 'reedkalisz-shared/datetime.js';
import { slugify } from 'reedkalisz-shared/utils.js';
import { Api } from '../base.js';
import { mergePositions, parseItems, printPosition } from '../common.js';
import { parseFormData, parseSearchParams, TIMEOUT, timedOut, timeout } from '../utils.js';
import { parsePrice, parseSize } from './EasyGifts.js';

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

function parsePrinting(row) {
  // Print: [{ Position: 'przód - po lewej stronie', Size: '100x80' (mm), Technique: ['TF1', 'DTF1'] }]
  return mergePositions((row?.Print ?? []).map((p) => printPosition([p.Technique].flat(), p.Position, p.Size)));
}

function parse(company, products, printing = null) {
  const handlingCosts = company?.api_handling_costs ?? [];
  const printingByCode = new Map((printing ?? []).map((row) => [row.CodeERP, row]));

  return parseItems(
    products
      // leftover header row and codeless banner rows
      .filter(($) => $.CodeERP && $.CodeERP !== 'symbol')
      .map(($) => {
        const { productCode } = parseCode($.CodeERP);
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
          _categories: [[$.MainCategoryPL, $.SubCategoryPL]],
          _labelings: printing ? parsePrinting(printingByCode.get($.CodeERP)) : undefined,
          _storage: {
            img: $.Foto,
            amount,
            api_color_code: $.CodeERP.trim(), // the whole code (the part after the product's is the colour)
            api_color_id: $.productId,
            color_first: colors.first, // str
            color_second: colors.second, // str
          },
        };
      }),
  );
}

// the fields of a product row `parse` reads (keep the two in step): the other ~50, mostly the same texts in three more
// languages, are dropped as each page comes, not held for all 10k rows until the last one
const FIELDS = [
  ...['productId', 'CodeERP', 'TitlePL', 'DescriptionPL', 'Dimensions', 'MaterialPL', 'ColorPL', 'Foto'],
  ...['NetPricePLN', 'Sale', 'HandlingCost', 'InStock', 'onOrder', 'nextDelivery', 'MainCategoryPL', 'SubCategoryPL'],
];
const pickFields = (row) => Object.fromEntries(FIELDS.map((field) => [field, row[field]]));

const fakeBrowserAgent =
  'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0. 2272.118 Safari/537.36';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Runs tasks at most `max` at a time, in the order they came. `max` may be lowered on the way (the running ones finish).
function pool(max) {
  let active = 0;
  const waiting = [];
  const run = async (task) => {
    if (active < run.max && !waiting.length) active++;
    else await new Promise((resolve) => waiting.push(resolve));
    try {
      return await task();
    } finally {
      if (active > run.max || !waiting.length) active--;
      else waiting.shift()();
    }
  };
  run.max = max;
  return run;
}

// a 429's Retry-After (seconds, or a date) in ms
const retryAfter = (header) =>
  header ? Number(header) * 1000 || Math.max(0, Date.parse(header) - Date.now()) || 0 : 0;

// Calls the api through the scan's pool, `seconds` at most a try (the body's reading included). Network errors,
// timeouts, 5xx, 429 and AXPOL's own `success: 0` get three tries, ~2 then ~4 s apart (jittered) or as long as a 429's
// Retry-After asks (up to 30 s); any other 4xx is final. A retry sends the rest of the scan one request at a time: AXPOL
// may say three are too many with a 503 or a timeout as well as a 429. A scan called off (`run.closed`) asks for
// nothing more, so a quick re-scan doesn't run beside the old one's leftovers.
async function fetchApi(
  run,
  method,
  { jwt = null, searchparams = null, formdata = null, seconds = TIMEOUT.call } = {},
) {
  const params = searchparams ? parseSearchParams(searchparams) : '';
  const name = searchparams?.method ?? formdata?.method;
  const attempt = async () => {
    const options = {
      method,
      headers: {
        Accept: '*/*', // for some reason, the api works with this and not 'Content-Type'
        'User-Agent': fakeBrowserAgent,
      },
      signal: timeout(seconds),
    };
    if (jwt) options.headers.Authorization = `Bearer ${jwt}`;
    if (formdata) options.body = parseFormData(formdata);

    const res = await fetch(`https://axpol.com/api/b2b-api/${params}`, options);
    if (!res.ok) {
      await res.arrayBuffer().catch(() => {}); // (an unread body holds the connection)
      const error = new Error(`${res.status} ${res.statusText}`);
      throw Object.assign(error, { status: res.status, retryAfter: retryAfter(res.headers.get('retry-after')) });
    }
    const body = await res.json();
    if (!Number(body?.success)) throw new Error(body?.message || 'success: 0');
    return body;
  };

  return await run(async () => {
    for (let tries = 1; ; tries++) {
      if (run.closed) throw new Error(`${name}: called off`);
      try {
        return await attempt();
      } catch (e) {
        const { status } = e;
        // (node-fetch's message holds the url, the api key in its query; the reason reaches the admin, in Polish)
        const reason = timedOut(e)
          ? `brak odpowiedzi w ciągu ${seconds} s`
          : String(e?.message ?? e).replace(/\?\S*/, '');
        if (tries === 3 || (status >= 400 && status < 500 && status !== 429)) {
          throw new Error(`${name}: ${reason}${tries > 1 ? ` (${tries} próby)` : ''}`, { cause: e });
        }
        run.max = 1;
        const wait = Math.max(2 ** tries * 1000 * (0.75 + Math.random() / 2), Math.min(e.retryAfter ?? 0, 30_000));
        console.log(`   - ${name} failed (${reason}), again in ${(wait / 1000).toFixed(1)} s`);
        await sleep(wait);
      }
    }
  });
}

// `session`: { run, key, uid, jwt, date }
const endpoints = {
  // these methods are based on the Postman collection
  customerLogin: async (run, key, username, password) => {
    // returns { success: 0/1, data: { uid: '123', jwt: '123' } }
    const params = { 'params[username]': username, 'params[password]': password };
    return await fetchApi(run, 'POST', { formdata: { method: 'Customer.Login', key, ...params } });
  },
  productCount: async ({ run, key, uid, jwt, date }) => {
    // returns { succes: 0/1, data: { count: '123' } }
    const params = { 'params[date]': date };
    return await fetchApi(run, 'GET', { jwt, searchparams: { method: 'Product.Count', key, uid, ...params } });
  },
  productList: async ({ run, key, uid, jwt, date }, limit, offset) => {
    // returns { success: 0/1, data: { 'id1': {}, 'id2': {}, ... } }
    const params = { 'params[date]': date, 'params[limit]': limit, 'params[offset]': offset };
    const searchparams = { method: 'Product.List', key, uid, ...params };
    return await fetchApi(run, 'GET', { jwt, searchparams, seconds: TIMEOUT.page });
  },
  printingCount: async ({ run, key, uid, jwt, date }) => {
    // returns { succes: 0/1, data: { count: '123' } }
    const params = { 'params[date]': date };
    return await fetchApi(run, 'GET', { jwt, searchparams: { method: 'Printing.Count', key, uid, ...params } });
  },
  printingList: async ({ run, key, uid, jwt, date }, limit, offset) => {
    // returns { success: 0/1, data: { 'id1': { productId, CodeERP, Print: [...] }, ... } }
    const params = { 'params[date]': date, 'params[limit]': limit, 'params[offset]': offset };
    const searchparams = { method: 'Printing.List', key, uid, ...params };
    return await fetchApi(run, 'GET', { jwt, searchparams, seconds: TIMEOUT.page });
  },
};

// every row of a paged list, 1000 at a time, three pages asked for at once (the pool decides when they go), in order;
// `keep` trims a row as its page comes. A page that doesn't come fails the list (a lost page of print data would read
// as products without labelings).
async function fetchAllRows(label, count, list, keep = (row) => row) {
  const limit = 1000;
  const pages = [];
  let next = 0;
  let failed = false;
  const worker = async () => {
    while (!failed && next * limit < count) {
      const offset = next++ * limit;
      console.log(`   - fetching ${label}: ${offset}-${offset + limit}/${count}`);
      try {
        const page = await list(limit, offset);
        if (!page?.data) throw new Error(`${label} page ${offset} not fetched`);
        pages[offset / limit] = Object.values(page.data).map(keep);
      } catch (e) {
        failed = true;
        throw e;
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  return pages.flat();
}

export class AXPOL extends Api {
  fetch = async ({ company, env: { username, password, key } }) => {
    const date = '2000-01-01 00:00:00'; // arbitrary date far enough in the past for all requests
    const run = pool(3); // for the products and the print data together

    // Login to the api and get the uid and jwt.
    const { uid, jwt } = (await endpoints.customerLogin(run, key, username, password)).data;
    const session = { run, key, uid, jwt, date };

    // the products and the print data side by side
    const products = async () => {
      const { count } = (await endpoints.productCount(session)).data;
      console.log(`   - count: ${count}`);
      const list = (limit, offset) => endpoints.productList(session, limit, offset);
      return await fetchAllRows('products', count, list, pickFields);
    };
    // print data is not essential: without it the products just have no labelings (called off when the products fail)
    const printing = async () => {
      try {
        const count = Number((await endpoints.printingCount(session)).data.count);
        const list = (limit, offset) => endpoints.printingList(session, limit, offset);
        return await fetchAllRows('printing', count, list);
      } catch (e) {
        console.log(`   - printing not fetched: ${e}`);
        return null;
      }
    };

    const fetched = products().catch((e) => {
      run.closed = true;
      throw e;
    });
    const items = parse(company, ...(await Promise.all([fetched, printing()])));
    return { items, lastScan: getISODate() };
  };
}
