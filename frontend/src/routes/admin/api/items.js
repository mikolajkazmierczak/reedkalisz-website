import { getUid } from '%/uid';
import { indexScan, scanProduct, scanVariant } from '@/match';
import { natural } from '%/order';
import { healthLevels } from './health.js';

function queryItems(items, query = null) {
  // query items name, code, storage color names and storage color code
  if (!query) return items;
  query = String(query).toLowerCase(); // already decoded, and a number after a reload
  return items.filter((item) => {
    // constructs a long string of item data to search in, not pretty but functional
    const str = (value) => (value ? String(value) : '');
    const storageString = item.storage
      .map((s) => str(s.color_first) + str(s.color_second) + str(s.api_color_code ?? '???'))
      .join('');
    const itemString = str(item.name) + str(item.code ?? '???') + storageString;
    return itemString.toLowerCase().includes(query);
  });
}

function sortItems(items, sort, complications) {
  // by: 'name' (then the code) or 'code' (then the name), `desc` the other way round; then, each over the ones
  // before (the list's buttons from the right): dbFirst: ours first; complicationsFirst: the ones that will be missing
  // something (the Komplikacje column: `complications(item)` -> one of healthLevels or null, see health.js) first, in
  // that order; newFirst: ours with variants we don't have yet first; notInApiFirst: products or
  // variants the api no longer has first

  const compare = (a, b) => (typeof a === 'string' ? natural(a, b) : 0);
  const way = sort.desc ? -1 : 1;
  sort.by === 'code'
    ? items.sort((a, b) => way * (compare(a.code ?? '', b.code ?? '') || compare(a.name, b.name)))
    : items.sort((a, b) => way * (compare(a.name, b.name) || compare(a.code ?? '', b.code ?? '')));

  if (sort.dbFirst) {
    // bubble items that are in the db
    items.sort((a, b) => {
      if (a.id && !b.id) return -1;
      if (!a.id && b.id) return 1;
      return 0;
    });
  }

  if (sort.complicationsFirst && complications) {
    const rank = (level) => (level ? healthLevels.indexOf(level) : healthLevels.length);
    const levels = new Map(items.map((item) => [item, rank(complications(item))]));
    items.sort((a, b) => levels.get(a) - levels.get(b));
  }

  // ours with new variants (the scan's ones we don't have, see merge)
  const fresh = (item) => item._db && item.storage.some((s) => !s._db);
  if (sort.newFirst) items.sort((a, b) => fresh(b) - fresh(a));

  if (sort.notInApiFirst) {
    // bubble what the api no longer has: whole products first (none of their variants there), then the ones with
    // some variants gone, then the ones with some gone and some new (as the list's cloud: red, orange, orange-purple)
    const retired = (item) => {
      if (!item._api || item.storage.every((s) => !s._api)) return 0;
      if (!item.storage.some((s) => !s._api)) return 3;
      return fresh(item) ? 2 : 1;
    };
    items.sort((a, b) => retired(a) - retired(b));
  }

  return items;
}

// ours, each marked with what the scan still has (see match.js), and the scan's products and variants we don't have
export function combine(dbItems, apiItems) {
  const scan = indexScan(apiItems);
  const mergedItems = [];
  const ours = new Set(); // codes of our variants
  const following = new Map(); // scan product -> our first product following it
  for (const db of dbItems) {
    const api = scanProduct(db, scan);
    const storage = db.storage.map((s) => ({ ...s, _db: true, _api: !!scanVariant(s, scan) }));
    for (const s of db.storage) if (s.api_color_code) ours.add(s.api_color_code);
    const item = { ...db, _db: true, _api: !!api, _scan: api, storage }; // (_scan: the scan's product, see health.js)
    mergedItems.push(item);
    if (api && !following.has(api)) following.set(api, item);
  }

  // the scan's variants we don't have: to be added to our product following theirs, or as a product of its own
  for (const api of apiItems) {
    const fresh = api.storage.filter((s) => !ours.has(s.api_color_code)).map((s) => ({ ...s, _db: false, _api: true }));
    const item = following.get(api);
    if (item) item.storage.push(...fresh);
    else if (fresh.length || !api.storage.length)
      mergedItems.push({ ...api, _db: false, _api: true, _scan: api, storage: fresh });
  }

  return mergedItems;
}

export function merge(company, dbItems, apiItems, { sort, query = null, complications = null }) {
  if (!company || !dbItems || !apiItems) return;
  const mergedItems = combine(dbItems, apiItems);

  // a product's uid is its code, told apart by its first variant when the code repeats; given in the order they
  // were built, so sorting or searching doesn't swap them
  const uids = new Set();
  const uid = (item) => {
    let id = getUid(company.name, item);
    if (uids.has(id)) id = `${id}~${item.storage[0]?.api_color_code ?? uids.size}`;
    uids.add(id);
    return id;
  };
  for (const item of mergedItems) item._uid = uid(item);

  sortItems(mergedItems, sort, complications);
  const queriedItems = queryItems(mergedItems, query);
  return queriedItems.map((item, i) => ({
    ...item,
    _index: i,
    // the variants by their codes too
    storage: [...item.storage]
      .sort((a, b) => natural(a.api_color_code, b.api_color_code))
      .map((s, j) => ({
        ...s,
        _uid: getUid(company.name, item, s),
        _index: j,
      })),
  }));
}

// what we have that the supplier no longer does, as the list shows it: our products without a variant in the scan (the
// "Wycofany" tag - one found by its code gets that product's new variants, so it has some), and the gone variants of
// the others -> { inDb: ours as merge() gives them, products, variants }
export function retiredOf(company, dbItems, apiItems) {
  const inDb = (merge(company, dbItems, apiItems, { sort: {} }) ?? []).filter((i) => i._db);
  const products = inDb.filter((i) => !i._api || i.storage.every((s) => !s._api));
  const variants = inDb.filter((i) => !products.includes(i)).flatMap((i) => i.storage.filter((s) => s._db && !s._api));
  return { inDb, products, variants };
}

// the items with each of their keys (a labeling code, a place), once each however often an item has it: key -> [item]
export function groupItems(items, keysOf) {
  const groups = new Map();
  for (const item of items ?? []) {
    for (const key of new Set(keysOf(item))) (groups.get(key) ?? groups.set(key, []).get(key)).push(item);
  }
  return groups;
}

// A product's cloud in the lists (Produkty, a mapping's products): what the supplier still has of it - gone, some
// colours gone (and new ones too), new colours, or all there -> { tone, title, icon } for its Button
export function cloudOf(item) {
  const notAll = item.storage.some((s) => !s._api);
  const none = item.storage.every((s) => !s._api) || !item._api;
  const fresh = item._db && item.storage.some((s) => !s._db);
  const [tone, title] = none
    ? ['danger', 'Wycofany']
    : notAll && fresh
      ? ['split', 'Wycofane i nowe kolory']
      : notAll
        ? ['warning', 'Wycofane kolory']
        : fresh
          ? ['new', 'Nowe kolory']
          : ['success', 'Dostępny'];
  return { tone, title, icon: none ? 'cloud_off' : 'cloud' };
}

function stripUsbSizes(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/\s*\d+(?:\.\d+)?\s*[GT]B(?:\s*\/\s*\d+(?:\.\d+)?\s*[GT]B)*\s*$/i, '').trim();
}

// the supplier's search for a product, also for what the api no longer has (their "not found" confirms it's gone)
function apiSearchUrl(company, code, name) {
  switch (company.name) {
    case 'PAR':
      return `https://www.par.com.pl/products?search=${code}`;
    case 'MidOcean':
      return `https://www.midocean.com/INTERSHOP/web/WFS/midocean-PL-Site/pl_PL/-/PLN/ViewParametricSearchBySearchIndex-Browse?SearchTerm=${code}`;
    case 'BlueCollection':
      return `https://bluecollection.gifts/pl/${code.split('-')[0]}.html`;
    case 'EasyGifts':
      return `https://www.easygifts.com.pl/search.php?dosearch=1&query=${code}`;
    case 'Macma':
      return `https://macma.pl/search.php?dosearch=1&query=${code}`;
    case 'Promotionway':
      return `https://promotionway.pl/search.php?query=${code}`;
    case 'AXPOL':
      return `https://axpol.com.pl/pl/search/?search=product&string=${code}`;
    case 'HappyBrands':
      // by name: a variant's code may have its product's in front ('605RM/605R01W'), which their search doesn't know
      return `https://happybrands.promo/searchProduct?name=${encodeURIComponent(name)}&category=0&color=&amount=`;
    case 'USBSystem':
      return `https://usbsystem.pl/?s=${stripUsbSizes(name).replace(' ', '+')}&post_type=product`;
    default:
      throw new Error('Company code not supported');
  }
}

// opened in a new tab: our product in its editor, the supplier's search for it
export const openProduct = (item) => window.open(`/admin/produkty/${item.slug}`, '_blank', 'noreferrer');
export const openApi = (company, code, name) => window.open(apiSearchUrl(company, code, name), '_blank', 'noreferrer');
