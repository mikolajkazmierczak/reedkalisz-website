import { getISODate } from 'reedkalisz-shared/datetime.js';
import { slugify } from 'reedkalisz-shared/utils.js';
import { Api } from '../base.js';
import { parseItems } from '../common.js';
import { parsePrice, parseSize } from './EasyGifts.js';

function parseMaterials(materials) {
  if (!materials) return [];
  return materials.split(',').map((m) => m.trim());
}

function getPolish(array, key) {
  return array.find((a) => a.language === 'pl')?.[key] || '';
}

function parseMarkingSize(info) {
  // info: 'WIDTH x HEIGHT mm' (rectangle) or 'DIAMETER' (circle), sizes in mm
  // return { width, height, area } - nulls if unparsable
  const numbers = (info ?? '').match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (numbers.length >= 2) {
    const [width, height] = numbers;
    return { width, height, area: width * height };
  }
  if (numbers.length === 1) {
    const [diameter] = numbers;
    return { width: diameter, height: diameter, area: Math.round(Math.PI * (diameter / 2) ** 2) };
  }
  return { width: null, height: null, area: null };
}

function parseMarking(markingData) {
  // markingData: [{ marking_place: [{ name_pl, marking_option: [{ option_code, option_info }] }] }]
  // Every option has its own field size, so each one becomes a separate labeling.
  // return [{ techniques: ['CODE'], label: 'Przód', width, height, area }, ...]
  return (markingData ?? []).flatMap((data) =>
    data.marking_place.flatMap((place) =>
      place.marking_option.map((option) => ({
        techniques: [option.option_code],
        label: place.name_pl,
        ...parseMarkingSize(option.option_info),
      })),
    ),
  );
}

function parse(company, products) {
  const getAdditional = (product, item) => product.additional.find((a) => a.item === item)?.value || '';

  return parseItems(
    products.map(($) => {
      const [productCode, colorCode] = $.index.split('-');
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
        _storage: {
          img: $.image.map((img) => img.url),
          amount: $.quantity,
          api_color_code: colorCode,
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
    const { access } = await fetchTokens({ url, login, hash });

    // fetch products
    const products = [];
    let page = 1;
    let count = null;
    let limit = null;
    while (true) {
      console.log(`   - fetching: page ${page}, limit ${limit ?? '?'}, count ${count ?? '?'}`);
      const res = await fetch(`${url}/products/?page=${page++}`, {
        headers: {
          Authorization: `Bearer ${access}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      products.push(...data.results);
      if (count === null) count = data.count;
      if (limit === null) limit = data.results.length;
      if (data.next === null) break; // no more pages
    }

    const items = parse(company, products);
    return { items, lastScan: getISODate() };
  };
}
