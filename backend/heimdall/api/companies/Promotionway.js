import { slugify } from "reedkalisz-shared/utils.js";
import { Api } from "../base.js";
import { parseItems } from "../common.js";
import { fetchSimpleApi, xmlToJson } from "../utils.js";
import { getPrice, getStock, parseCode, parsePrice, parseSize } from "./EasyGifts.js";

function parseMaterials(materials) {
  // materials: { material: { name: str } } -> [str, ...]
  if (!materials) return [];
  return Object.values(materials).map((m) => m?.name).filter((m) => m && !m === "#N/A");
}

function parseStock(stock) {
  // stock is always an object with stock1 and stock2 being a string ('0' if not in stock)
  if (!stock) return null; // "ask about stock"
  return ((Number(stock?.stock1) || 0) + (Number(stock?.stock2) || 0)) || null; // 24h + 5-7 days
}

function parseImages(images) {
  // images: { image1: str, image2: str, ... } -> [str, str, ...]
  if (!images) return [];
  return Object.values(images).filter((img) => img);
}

function parse(company, offer, prices, stocks) {
  offer = xmlToJson(offer).xml.product;
  prices = xmlToJson(prices).xml.product;
  stocks = xmlToJson(stocks).xml.product;

  return parseItems(offer.map(($) => {
    const { productCode, colorCode } = parseCode($?.baseinfo?.codeShort, $?.baseinfo?.codeFull);
    const name = $?.baseinfo?.name || "";
    const description = $?.baseinfo?.intro?.cdata || "";
    const size = parseSize($?.attributes?.size);
    const price = getPrice(prices, $?.baseinfo?.codeFull, "codeFull");
    const stock = getStock(stocks, $?.baseinfo?.codeFull, "codeFull");

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
      // isDiscount == 1 means apply discount for non brand items (from company)
      // isBrandsDiscount == 1 means apply discount for brand items
      price: parsePrice(company, price?.price, price?.isDiscount === "1" || price?.isBrandsDiscount === "1"),
      _storage: {
        img: parseImages($?.images),
        amount: parseStock(stock),
        api_color_code: colorCode, // THIS IS NOT THE COLOR ATTRIBUTE CODE, it's a separate code
        api_color_id: $?.baseinfo?.id,
        color_first: $?.color?.name || null, // str
        _color_first_hex: $?.color?.hex ? `#${$?.color?.hex}` : null,
      },
    };
  }));
}

export class Promotionway extends Api {
  fetch = async ({ company }) =>
    fetchSimpleApi({
      company,
      routes: ["offer", "prices", "stocks"],
      url: (route) => `https://promotionway.pl/data/webapi/pl/xml/${route}.xml`,
      parse,
    });
}
