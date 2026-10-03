import fetch from 'node-fetch';
import { getISODate } from 'reedkalisz-shared/datetime.js';
import { slugify } from 'reedkalisz-shared/utils.js';
import { Api } from '../base.js';
import { addCategories, mergePositions, printPosition, uniqueMaterials } from '../common.js';
import { TIMEOUT, timeout } from '../utils.js';

function parseStorage(item) {
  const { imgs, amount, id, colors } = item;
  return {
    img: imgs,
    amount,
    api_color_code: item.code, // the variant's whole code
    api_color_id: id,
    multicolored: false,
    color_first: colors[0] ?? null, // str
    color_second: colors[1] ?? null, // str
  };
}

function parseMain(item, code) {
  const name = item.name.split(',')[0].trim();
  const sizes = item.size.split('x').map(Number);
  const { desc, materials, price } = item;
  return {
    // only define fields that are both:
    // - different from defaults
    // - pertain to the PAR api (e.g. enabled will be defined later)
    name,
    code,
    slug: slugify([code, name], { key: true }),
    seo_title: name,
    seo_description: desc,
    description: desc,
    size_x: sizes.length > 0 ? sizes[0] : null,
    size_y: sizes.length > 1 ? sizes[1] : null,
    size_z: sizes.length > 2 ? sizes[2] : null,
    materials,
    price,
    storage: [parseStorage(item)], // first color variant
    gallery: [],
    _categories: addCategories([], item.categories),
    _labelings: item.labelings,
  };
}

function parseDecorations(decorations) {
  // techniki_zdobienia: [{ technic_category: 'L2', miejsce_zdobienia: 'na przodzie', maksymalny_rozmiar_logo: '50x30',
  // wymiary_zdobienia: '75x100' }] - sizes in mm, the logo's is what can be printed; 'XXX' is a place left unnamed
  return mergePositions(
    (decorations ?? []).map((d) =>
      printPosition(
        [d.technic_category],
        d.miejsce_zdobienia === 'XXX' ? '' : d.miejsce_zdobienia,
        d.maksymalny_rozmiar_logo || d.wymiary_zdobienia,
      ),
    ),
  );
}

function parseCode(code) {
  // 'R12345', 'R12345.02', 'R12345.00.QII' -> 'R12345': the product is what's before the first dot (after it, the
  // colour and sometimes the quality)
  return { productCode: code.split('.')[0] };
}

function parseCategoryTree(categories) {
  // { categories: [{ category: { id, name, nodes: [{ id, name, nodes }] } }] } -> Map(id -> ['root', ..., 'name'])
  const paths = new Map();
  const walk = (node, path) => {
    const here = [...path, node.name];
    paths.set(String(node.id), here);
    for (const child of node.nodes ?? []) walk(child, here);
  };
  for (const { category } of categories?.categories ?? []) walk(category, []);
  return paths;
}

function parse(products, stocks, categories) {
  const categoryPaths = parseCategoryTree(categories);
  products = products.products.map((item) => item.product);
  const stocksById = new Map(stocks.products.map(({ product }) => [String(product.id), product]));
  const items = products.map(($) => {
    const s = stocksById.get(String($.id));
    return {
      id: Number($.id),
      code: $.kod,
      name: $.nazwa,
      desc: $.opis,
      size: $.wymiary,
      // the additional ones are a list of their own: 'PP, stal nierdzewna 18/0'
      materials: uniqueMaterials([$.material_wykonania, $.material_dodatkowy].flatMap((m) => (m ?? '').split(','))),
      colors: [$.kolor_podstawowy, $.kolor_dodatkowy].filter(Boolean),
      // tag-like categories (e.g. "Gadżety do 20 zł") are not in the tree, they stay flat
      // (without the tree none are given: flat subcategory names would match no mapping and drop the mapped ones)
      categories: categoryPaths.size ? ($.kategorie ?? []).map((k) => categoryPaths.get(String(k.id)) ?? [k.name]) : [],
      imgs: $.zdjecia.map((item) => `https://www.par.com.pl${item.zdjecie}`),
      labelings: parseDecorations($.techniki_zdobienia),
      amount: s ? Number(s.stan_magazynowy) : null,
      price: s ? Number(s.cena_po_rabacie) : null,
    };
  });

  const parsed = [];
  for (let item of items) {
    const { productCode } = parseCode(item.code);
    // first create main item (and first storage item), then add storage items
    const i = parsed.findIndex((item) => item.code == productCode);
    if (i === -1) parsed.push(parseMain(item, productCode));
    else {
      if (parsed[i].price < item.price) parsed[i].price = item.price; // replace with highest price
      parsed[i].storage.push(parseStorage(item));
      addCategories(parsed[i]._categories, item.categories);
      if (!parsed[i]._labelings.length) parsed[i]._labelings = item.labelings; // from the first variant that has any
    }
  }
  return parsed;
}

export class PAR extends Api {
  fetch = async ({ env: { username, password } }) => {
    const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    const get = (url) => fetch(url, { headers: { Authorization: auth }, signal: timeout(TIMEOUT.feed) });
    const [resProducts, resStocks, resCategories] = await Promise.all([
      get('https://www.par.com.pl/api/products.json'),
      get('https://www.par.com.pl/api/stocks.json'),
      get('https://www.par.com.pl/api/categories.json'),
    ]);
    const products = await resProducts.json();
    const stocks = await resStocks.json();
    const categories = resCategories.ok ? await resCategories.json() : null; // without it the categories are skipped

    const items = parse(products, stocks, categories);
    return { items, lastScan: getISODate() };
  };
}
