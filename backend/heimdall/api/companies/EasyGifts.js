import { slugify } from "reedkalisz-shared/utils.js";
import { Api } from "../base.js";
import { parseItems } from "../common.js";
import { fetchSimpleApi } from "../utils.js";

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

export function parsePrice(company, price, applyDiscount = false) {
  let value = price ? Number(price.replace(",", ".")) : 0;
  if (value && applyDiscount) {
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
  const variableSize = size?.includes("(") || size?.includes(")");
  if (!size || variableSize) return { x: null, y: null, z: null };
  size = size.replace(/\.$/, ""); // remove trailing dot (after unit)
  size = size.replaceAll(" ", ""); // remove spaces
  size = size.replaceAll("⌀", "").replaceAll("Ø", "").replaceAll("&#216;", ""); // remove diameter symbol
  const unitScale = { mm: 1, cm: 10, m: 1000 };
  const unit = size.match(/mm|cm|m/)?.[0] || "mm";
  size = size.replace(unit, ""); // remove unit
  const splitter = size.includes("x") ? "x" : "×";
  const [x, y, z] = size.split(splitter).map((a) => Number(a.replace(",", ".")));
  const value = (v) => (v ? v * unitScale[unit] : null);
  return { x: value(x), y: value(y), z: value(z) };
}

export function parseCode(short, full) {
  const isUnset = (code) => typeof code !== "string" || code === "";
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

// TODO: are prices same for all variants (pendrives? textiles?)
export const getPrice = (prices, codeFull, key = "code_full") => prices.find((p) => p?.[key] === codeFull);
export const getStock = (stocks, codeFull, key = "code_full") => stocks.find((s) => s?.[key] === codeFull);

function parse(company, offer, prices, stocks) {
  prices = prices.products;

  return parseItems(offer.map(($) => {
    const { productCode, colorCode } = parseCode($?.baseinfo?.code_short, $?.baseinfo?.code_full);
    const name = $?.baseinfo?.name || "";
    const description = $?.baseinfo?.intro || "";
    const size = parseSize($?.attributes?.size);
    const price = getPrice(prices, $?.baseinfo?.code_full);
    const stock = getStock(stocks, $?.baseinfo?.code_full);

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
      _storage: {
        img: parseImages($?.images),
        amount: parseStock(stock),
        api_color_code: colorCode,
        api_color_id: $?.baseinfo?.id,
        color_first: $?.color?.name || null, // str
        _color_first_hex: $?.color?.hex ? `#${$?.color?.hex}` : null,
      },
    };
  }));
}

export const fetchApi = async (company, hostname) =>
  fetchSimpleApi({
    company,
    routes: ["offer", "prices", "stocks"],
    url: (route) => `https://${hostname}/data/webapi2/pl/json/${route}.json`,
    parse,
  });

export class EasyGifts extends Api {
  fetch = async ({ company }) => fetchApi(company, "www.easygifts.com.pl");
}
