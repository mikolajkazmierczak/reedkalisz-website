import { slugify } from 'reedkalisz-shared/utils.js';
import { Api } from '../base.js';
import { parseItems } from '../common.js';
import { arraysToJson, fetchSimpleApi } from '../utils.js';

function parseStock(stock) {
  if (!stock) return null; // "ask about stock"
  return Number(stock.quantity37days || stock.quantity24h || 0); // 2-3 days or 24h, 0 means "out of stock"
}

export function parsePrice(company, price, applyDiscount = false) {
  let value = price ? Number(price.replace(',', '.')) : 0;
  if (applyDiscount) {
    const discount = company.api_discount ?? 0;
    value = value * ((100 - discount) / 100);
    value = Number(value.toFixed(2));
  }
  return value;
}

export function parseSize(size) {
  // (2,5 - 3,5) cm -> { x: null, y: null, z: null } // variable size not supported
  // Ø 2,5 mm / &#216;2,5 mm -> { x: 2.5, y: null, z: null } // diameter symbol not supported
  // 2,5 mm. -> { x: 2.5, y: null, z: null } // trailing dot
  // 2,5 mm -> { x: 2.5, y: null, z: null }
  // 2,5 cm -> { x: 25, y: null, z: null }
  // 2,5 m -> { x: 2500, y: null, z: null }
  // 2,5 x 2,5 cm -> { x: 25, y: 25, z: null }
  // 2,5 x 2,5 x 2,5 cm -> { x: 25, y: 25, z: 25 }
  const variableSize = size?.includes('(') || size?.includes(')');
  if (!size || variableSize) return { x: null, y: null, z: null };
  size = size.replace(/\.$/, ''); // remove trailing dot (after unit)
  size = size.replaceAll(' ', ''); // remove spaces
  size = size.replaceAll('⌀', '').replaceAll('Ø', '').replaceAll('&#216;', ''); // remove diameter symbol
  const unitScale = { mm: 1, cm: 10, m: 1000 };
  const unit = size.match(/mm|cm|m/)?.[0] || 'mm';
  size = size.replace(unit, ''); // remove unit
  const splitter = size.includes('x') ? 'x' : '×';
  const [x, y, z] = size.split(splitter).map(a => Number(a.replace(',', '.')));
  const value = v => (v ? v * unitScale[unit] : null);
  return { x: value(x), y: value(y), z: value(z) };
}

export function parseCode(short, full) {
  const isUnset = code => typeof code !== 'string' || code === '';
  if (isUnset(short) && isUnset(full)) {
    return { productCode: null, colorCode: null };
  }
  // if either code is unset while the other is set, or both are set and match, then each color is a separate product
  if (isUnset(short) && !isUnset(full)) {
    return { productCode: full, colorCode: null };
  } else if (!isUnset(short) && isUnset(full)) {
    return { productCode: short, colorCode: null };
  } else if (short === full) {
    return { productCode: short, colorCode: null };
  }
  const commonLength = Math.min(short.length, full.length);
  const productCode = short.slice(0, commonLength + 1);
  const colorCode = full.slice(commonLength);
  return { productCode, colorCode };
}

export function getPrice(prices, codeFull) {
  return prices.find(price => {
    return price?.codeFull === codeFull; // TODO: are prices same for all variants (pendrives? textiles?)
  });
}

export function getStock(stocks, codeFull) {
  return stocks.find(stock => {
    return stock?.codeFull === codeFull;
  });
}

function parse(company, offer, prices, stocks) {
  offer = arraysToJson(offer); // some empty products in api...
  prices = arraysToJson(prices);
  stocks = arraysToJson(stocks);

  const items = offer.map($ => {
    const { productCode, colorCode } = parseCode($.codeShort, $.codeFull);
    const name = $.name || '';
    const description = $.intro || '';
    const size = parseSize($.size);
    const price = getPrice(prices, $.codeFull);
    const stock = getStock(stocks, $.codeFull);
    
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
      materials: $.materials,
      // additionalOffer == 1 means the product is a non brand item, so no discount (not from company)
      // priceWithoutDiscount == 1 is self explanatory
      price: parsePrice(company, price.price, price.additionalOffer !== 1 && price.priceWithoutDiscount !== 1),
      _storage: {
        img: $.images,
        amount: parseStock(stock),
        api_color_code: colorCode,
        api_color_id: $.id,
        color_first: $.colorName || null, // str
        _color_first_hex: $.colorHex ? `#${$.colorHex}` : null // str
      }
    };
  });

  return parseItems(items);
}

export async function fetchApi(company, hostname) {
  return fetchSimpleApi({
    company,
    routes: ['offer', 'prices', 'stocks'],
    url: route => `https://${hostname}/data/webapi/pl/json/${route}.json`,
    parse
  });
}

export class EasyGifts extends Api {
  async fetch({ company }) {
    return fetchApi(company, 'www.easygifts.com.pl');
  }
}
