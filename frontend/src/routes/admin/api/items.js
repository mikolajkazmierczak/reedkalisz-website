import { getUid } from '%/uid';
import { indexScan, scanProduct, scanVariant } from '@/match';
import { natural } from '%/order';

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
  // something (the Komplikacje column: `complications(item)` -> 'red' | 'orange' | null) first, red before orange;
  // newFirst: ours with variants we don't have yet first; notInApiFirst: products or variants the api no longer has
  // first

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
    const rank = { red: 0, orange: 1 };
    const levels = new Map(items.map((item) => [item, rank[complications(item)] ?? 2]));
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

export function merge(company, dbItems, apiItems, { sort, query = null, complications = null }) {
  if (!company || !dbItems || !apiItems) return;
  const scan = indexScan(apiItems);
  const mergedItems = [];

  // ours, each marked with what the scan still has (see match.js)
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
