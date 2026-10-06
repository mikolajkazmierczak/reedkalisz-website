import { slugify } from 'reedkalisz-shared/utils.js';
import { Api } from '../base.js';
import { mergePositions, parseItems, printPosition } from '../common.js';
import { fetchSimpleApi } from '../utils.js';

function parseMaterials(materials) {
  // materials: [{ name: str }, ...] -> [str, ...]
  if (!materials) return [];
  return materials.map((m) => m?.name).filter((m) => m);
}

function parseImages(images) {
  // images: [{ file: str }, ... ] -> [str, str, ...]
  if (!images) return [];
  return images.map((img) => img?.file).filter((img) => img);
}

function parseStock(stock) {
  if (!stock) return null; // "ask about stock"
  return Number(stock?.stock || 0) + Number(stock?.stocks?.[0]?.quantity || 0); // 24h + 2-3 days
}

// a feed's price ('12,34') -> the number, with the company's discount when asked; none (missing, empty, 0) -> null:
// the site shows "Zapytaj o cenę"
export function parsePrice(company, price, applyDiscount = false) {
  let value = price ? Number(price.replace(',', '.')) : 0;
  if (!value) return null;
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
  // 2,5 cm / 3,5 cm -> { x: 25, y: null, z: null } // only first size supported
  // 2,5 mm. -> { x: 2.5, y: null, z: null } // trailing dot
  // 2,5 mm -> { x: 2.5, y: null, z: null }
  // 2,5 cm -> { x: 25, y: null, z: null }
  // 2,5 m -> { x: 2500, y: null, z: null }
  // 2,5 x 2,5 cm -> { x: 25, y: 25, z: null }
  // 2,5 x 2,5 x 2,5 cm -> { x: 25, y: 25, z: 25 }
  const variableSize = size?.includes('(') || size?.includes(')');
  if (!size || variableSize) return { x: null, y: null, z: null };
  size = size.split('/')[0]; // only first size supported
  size = size.replace(/\.$/, ''); // remove trailing dot (after unit)
  size = size.replaceAll(' ', ''); // remove spaces
  size = size.replaceAll('⌀', '').replaceAll('Ø', '').replaceAll('&#216;', ''); // remove diameter symbol
  const unitScale = { mm: 1, cm: 10, m: 1000 };
  const unit = size.match(/mm|cm|m/)?.[0] || 'mm';
  size = size.replace(unit, ''); // remove unit
  const splitter = size.includes('x') ? 'x' : '×';
  const [x, y, z] = size.split(splitter).map((a) => Number(a.replace(',', '.')));
  const value = (v) => (v ? v * unitScale[unit] : null);
  return { x: value(x), y: value(y), z: value(z) };
}

export function parseCode(short, full) {
  const isUnset = (code) => typeof code !== 'string' || code === '';
  if (isUnset(short) && isUnset(full)) {
    return { productCode: null };
  }
  // if either code is unset while the other is set, or both are set and match, then each color is a separate product
  if (isUnset(short) && !isUnset(full)) {
    return { productCode: full };
  } else if (!isUnset(short) && isUnset(full)) {
    return { productCode: short };
  } else if (short === full) {
    return { productCode: short };
  }
  const commonLength = Math.min(short.length, full.length);
  const productCode = short.slice(0, commonLength + 1);
  return { productCode };
}

function parseCategories(categories) {
  // categories: [{ name, subcategory: { name } }, ...] - one entry per subcategory
  // -> [['name', 'subcategory name'], ...]
  return (categories ?? []).flatMap((c) => {
    const subs = [c?.subcategory].flat().filter(Boolean);
    return subs.length ? subs.map((s) => [c?.name, s?.name]) : [[c?.name]];
  });
}

function parseMarkings(entry) {
  // products-markings: { places: [{ name: 'Przód', marking_code: 'T1', marking_size: '10 x 5 cm' }, ...] }
  return mergePositions((entry?.places ?? []).map((p) => printPosition([p.marking_code], p.name, p.marking_size)));
}

// rows of the prices / stocks / markings files by the variant's full code
export const byCode = (rows, key = 'code_full') => new Map((rows ?? []).map((row) => [row?.[key], row]));

function parse(company, offer, prices, stocks, markings) {
  const pricesByCode = byCode(prices.products);
  const stocksByCode = byCode(stocks);
  const markingsByCode = new Map((markings ?? []).map((m) => [m?.baseinfo?.code_full, m]));

  return parseItems(
    offer.map(($) => {
      const { productCode } = parseCode($?.baseinfo?.code_short, $?.baseinfo?.code_full);
      const name = $?.baseinfo?.name || '';
      const description = $?.baseinfo?.intro || '';
      const size = parseSize($?.attributes?.size);
      const price = pricesByCode.get($?.baseinfo?.code_full);
      const stock = stocksByCode.get($?.baseinfo?.code_full);

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
        materials: parseMaterials($?.materials),
        price: parsePrice(company, price?.price, !price?.no_discount && !price?.additional_offer),
        _categories: parseCategories($?.categories),
        _labelings: markings ? parseMarkings(markingsByCode.get($?.baseinfo?.code_full)) : undefined,
        _storage: {
          img: parseImages($?.images),
          amount: parseStock(stock),
          api_color_code: $?.baseinfo?.code_full || productCode, // the variant's whole code
          api_color_id: $?.baseinfo?.id,
          color_first: $?.color?.name || null, // str
          _color_first_hex: $?.color?.hex ? `#${$?.color?.hex}` : null,
        },
      };
    }),
  );
}

export const fetchApi = async (company, hostname) =>
  fetchSimpleApi({
    company,
    routes: ['offer', 'prices', 'stocks'],
    optional: ['products-markings'],
    url: (route) => `https://${hostname}/data/webapi2/pl/json/${route}.json`,
    parse,
  });

export class EasyGifts extends Api {
  fetch = async ({ company }) => fetchApi(company, 'www.easygifts.com.pl');
}
