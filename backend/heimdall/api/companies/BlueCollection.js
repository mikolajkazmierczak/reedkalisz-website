import { getISODate } from 'reedkalisz-shared/datetime.js';
import { slugify } from 'reedkalisz-shared/utils.js';
import { Api } from '../base.js';
import { mergePositions, parseItems, printPosition } from '../common.js';
import { parsePrice, parseSize } from './EasyGifts.js';

function parseMaterials(materials) {
  if (!materials) return [];
  return materials.split(',').map((m) => m.trim());
}

function getPolish(array, key) {
  return array.find((a) => a.language === 'pl')?.[key] || '';
}

function parseMarking(markingData) {
  // markingData: [{ marking_place: [{ name_pl, marking_option: [{ option_code, option_info }] }] }]
  // option_info: 'WIDTH x HEIGHT mm' (rectangle) or 'DIAMETER' (circle), sizes in mm; every option has its own size
  return mergePositions(
    (markingData ?? []).flatMap((data) =>
      data.marking_place.flatMap((place) =>
        place.marking_option.map((option) => printPosition([option.option_code], place.name_pl, option.option_info)),
      ),
    ),
  );
}

// A GET with the access token. It lasts 5 minutes: when it's refused, a new one comes from the refresh token.
function authorized(api, tokens) {
  const get = (url) => fetch(url, { headers: { Authorization: `Bearer ${tokens.access}` } });
  return async (url) => {
    let res = await get(url);
    if (res.status === 401 && tokens.refresh) {
      const refreshed = await fetch(`${api}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });
      tokens.access = (await refreshed.json()).access;
      res = await get(url);
    }
    if (!res.ok) throw new Error(`${url} responded with ${res.status}`);
    return await res.json();
  };
}

async function fetchAll(url, get) {
  // follow the `next` links of a paginated endpoint
  const results = [];
  for (let page = 1; url; page++) {
    console.log(`   - fetching: ${url.split('/api/')[1]} page ${page}`);
    const data = await get(url);
    results.push(...data.results);
    url = data.next;
  }
  return results;
}

function parseCategories($, categories, subcategories) {
  // products only hold ids: category + subcategory, and an optional additional pair
  const name = (list, id) => list.find((c) => c.id === id)?.pl ?? null;
  return [
    [$.category, $.subcategory],
    [$.additional_category, $.additional_subcategory],
  ]
    .filter(([category]) => category != null)
    .map(([category, subcategory]) => [name(categories, category), name(subcategories, subcategory)]);
}

function parse(company, products, categories = [], subcategories = []) {
  const getAdditional = (product, item) => product.additional.find((a) => a.item === item)?.value || '';

  return parseItems(
    products.map(($) => {
      const [productCode] = $.index.split('-');
      const name = getPolish($.names, 'title');
      const description = getPolish($.descriptions, 'text');
      const size = parseSize(getAdditional($, 'dimensions'));
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
        materials: parseMaterials(getAdditional($, 'material_pl')),
        price: parsePrice(company, $.prices[0].pln, $.discount_prices),
        _labelings: parseMarking($.marking_data),
        _categories: parseCategories($, categories, subcategories),
        _storage: {
          img: $.image.map((img) => img.url),
          amount: $.quantity,
          api_color_code: $.index, // the variant's whole code
          api_color_id: $.id,
          color_first: getAdditional($, 'color_product'),
        },
      };
    }),
  );
}

async function fetchTokens({ url, login, hash }) {
  // fetch refresh and access tokens
  const res = await fetch(`${url}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: login, password: hash }),
  });
  return await res.json();
}

export class BlueCollection extends Api {
  fetch = async ({ company, env: { login, hash } }) => {
    const url = 'https://developers.bluecollection.eu/api';
    const get = authorized(url, await fetchTokens({ url, login, hash }));

    const products = await fetchAll(`${url}/products/?page=1`, get);

    // categories are not essential, a failure only leaves the products without them
    const [categories, subcategories] = await Promise.all([
      fetchAll(`${url}/categories/`, get),
      fetchAll(`${url}/subcategories/`, get),
    ]).catch((e) => {
      console.log(`   - categories not fetched: ${e}`);
      return [[], []];
    });

    const items = parse(company, products, categories, subcategories);
    return { items, lastScan: getISODate() };
  };
}
