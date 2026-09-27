import { slugify } from 'reedkalisz-shared/utils.js';
import { Api } from '../base.js';
import { mergePositions, parseItems, printPosition } from '../common.js';
import { fetchSimpleApi, xmlToJson } from '../utils.js';
import { byCode, parseCode, parsePrice, parseSize } from './EasyGifts.js';

function parseMaterials(materials) {
  // materials: { material: { name: str } | [{ name: str }, ...] } -> [str, ...] (an empty name tag comes as {})
  if (!materials) return [];
  return [materials.material]
    .flat()
    .map((m) => m?.name)
    .filter((m) => typeof m === 'string' && m !== '#N/A');
}

function parseStock(stock) {
  // stock is always an object with stock1 and stock2 being a string ('0' if not in stock)
  if (!stock) return null; // "ask about stock"
  const amount = (Number(stock?.stock1) || 0) + (Number(stock?.stock2) || 0); // 24h + 5-7 days
  return amount || (Number(stock?.onRequest) ? null : amount);
}

function parseImages(images) {
  // images: { image1: str, image2: str, ... } -> [str, str, ...]
  if (!images) return [];
  return Object.values(images).filter(Boolean);
}

function parseCategories(categories) {
  // <categories><category><name/><subcategory><name/><subsubcategory>...</subcategory></category></categories>
  // any level can be a single node or a list -> [['category', 'subcategory', 'subsubcategory'], ...]
  const levels = ['category', 'subcategory', 'subsubcategory'];
  const walk = (node, depth, path) => {
    const here = [...path, node?.name];
    const children = [node?.[levels[depth + 1]]].flat().filter(Boolean);
    return children.length ? children.flatMap((c) => walk(c, depth + 1, here)) : [here];
  };
  return [categories?.category]
    .flat()
    .filter(Boolean)
    .flatMap((c) => walk(c, 0, []));
}

function parseMarkgroups(markgroups) {
  // <markgroups><markgroup><name>T1 (tampodruk)</name><marking_size>5 x 0,5 cm</marking_size><info>korpus</info>
  // - the technique's code starts its name, the place is the info
  // - sizes are in cm, also the ones without a unit ('20 x 15', 'Ø 3,0')
  const inCm = (s) => (typeof s === 'string' && /\d/.test(s) && !/[cm]m/i.test(s) ? `${s} cm` : s);
  return mergePositions(
    [markgroups?.markgroup]
      .flat()
      .filter(Boolean)
      .map((g) =>
        printPosition([typeof g?.name === 'string' ? g.name.split(/[\s(]/)[0] : null], g?.info, inCm(g?.markingSize)),
      ),
  );
}

function parse(company, offer, prices, stocks) {
  offer = xmlToJson(offer).xml.product;
  prices = xmlToJson(prices).xml.product;
  stocks = xmlToJson(stocks).xml.product;
  const pricesByCode = byCode(prices, 'codeFull');
  const stocksByCode = byCode(stocks, 'codeFull');

  return parseItems(
    offer.map(($) => {
      const { productCode } = parseCode($?.baseinfo?.codeShort, $?.baseinfo?.codeFull);
      const name = $?.baseinfo?.name || '';
      const description = $?.baseinfo?.intro || '';
      const size = parseSize($?.attributes?.size);
      const price = pricesByCode.get($?.baseinfo?.codeFull);
      const stock = stocksByCode.get($?.baseinfo?.codeFull);

      return {
        _incompatible: productCode === null || !!price?.priceFrom1,
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
        // isDiscount == 1 means apply discount for non brand items (from company)
        // isBrandsDiscount == 1 means apply discount for brand items
        price: parsePrice(company, price?.price, price?.isDiscount === '1' || price?.isBrandsDiscount === '1'),
        _categories: parseCategories($?.categories),
        _labelings: parseMarkgroups($?.markgroups),
        _storage: {
          img: parseImages($?.images),
          amount: parseStock(stock),
          // the variant's whole code (its colour part is not the colour's code, it's a code of its own)
          api_color_code: typeof $?.baseinfo?.codeFull === 'string' ? $.baseinfo.codeFull : productCode,
          api_color_id: $?.baseinfo?.id,
          color_first: $?.color?.name || null, // str
          _color_first_hex: $?.color?.hex ? `#${$?.color?.hex}` : null,
        },
      };
    }),
  );
}

export class Promotionway extends Api {
  fetch = async ({ company }) =>
    fetchSimpleApi({
      company,
      routes: ['offer', 'prices', 'stocks'],
      url: (route) => `https://promotionway.pl/data/webapi/pl/xml/${route}.xml`,
      parse,
    });
}
