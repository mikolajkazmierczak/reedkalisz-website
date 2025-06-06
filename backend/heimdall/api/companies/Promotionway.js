import { slugify } from 'reedkalisz-shared/utils.js';
import { Api } from '../base.js';
import { xmlToJson, fetchSimpleApi } from '../utils.js';
import { parseItems } from '../common.js';
import { getPrice, getStock, parseCode, parseSize, parsePrice } from './EasyGifts.js';

function parseStock(stock) {
  // stock is always an object with stock1 and stock2 being a string that is '0' if not in stock
  // first try 5-7 days (it's usually larger) then 24h, if both are 0 then "ask about stock"
  return Number(stock?.stock2) || Number(stock?.stock1) || null;
}

function parseImages(images) {
  // images: { image1: str, image2: str, ... } -> [str, str, ...]
  if (!images) return [];
  return Object.values(images).filter(i => i);
}

function parseMaterials(materials) {
  // materials: { material: {} / [{}] } -> [{}, ...]
  if (!materials) return [];
  if (Array.isArray(materials.material)) return materials.material;
  return [materials.material];
}

function parse(company, offer, prices, stocks) {
  offer = xmlToJson(offer).xml.product;
  prices = xmlToJson(prices).xml.product;
  stocks = xmlToJson(stocks).xml.product;

  const items = offer.map($ => {
    const { productCode, colorCode } = parseCode($?.baseinfo?.codeShort, $?.baseinfo?.codeFull);
    const name = $?.baseinfo?.name || '';
    const description = $?.baseinfo?.intro?.cdata || '';
    const size = parseSize($?.attributes?.size);
    const price = getPrice(prices, productCode);
    const stock = getStock(stocks, productCode, colorCode);
    return {
      _incompatible: productCode === null,
      name,
      code: productCode,
      slug: slugify([productCode, name], { key: true }),
      seo_title: name,
      seo_description: description,
      description,
      size_x: size.x,
      size_y: size.y,
      size_z: size.z,
      materials: parseMaterials($?.materials),
      // is_discount == 1 means apply discount for non brand items (from company)
      // is_brands_discount == 1 means apply discount for brand items
      price: parsePrice(company, price?.price, price?.isDiscount === '1' || price?.isBrandsDiscount === '1'),
      _storage: {
        img: parseImages($?.images),
        amount: parseStock(stock),
        api_color_code: colorCode, // THIS IS NOT THE COLOR ATTRIBUTE CODE, it's a separate code
        api_color_id: $?.baseinfo?.id,
        color_first: $?.color?.name || null, // str
        _color_first_hex: $?.color?.hex ? `#${$?.color?.hex}` : null
      }
    };
  });

  return parseItems(items);
}

export class Promotionway extends Api {
  async fetch({ company }) {
    return fetchSimpleApi({
      company,
      routes: ['offer', 'prices', 'stocks'],
      url: route => `https://promotionway.pl/data/webapi/pl/xml/${route}.xml`,
      parse
    });
  }
}
