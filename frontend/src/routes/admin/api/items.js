import { getUid } from '%/uid';
import { indexScan, scanProduct, scanVariant } from '@/match';

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

function sortItems(items, sort) {
  // nameFirst: by name, then code (else the other way round); dbFirst: ours first;
  // notInApiFirst: products or variants the api no longer has first

  const compare = (a, b) => (typeof a === 'string' ? a.localeCompare(b) : 0);
  sort.nameFirst
    ? items.sort((a, b) => compare(a.name, b.name) || compare(a.code ?? '', b.code ?? ''))
    : items.sort((a, b) => compare(a.code ?? '', b.code ?? '') || compare(a.name, b.name));

  if (sort.dbFirst) {
    // bubble items that are in the db
    items.sort((a, b) => {
      if (a.id && !b.id) return -1;
      if (!a.id && b.id) return 1;
      return 0;
    });
  }

  if (sort.notInApiFirst) {
    // bubble items that are not in the api, or that have storage that is not in the api
    const removed = (item) => !item._api || item.storage.some((s) => !s._api);
    items.sort((a, b) => {
      if (removed(a) && !removed(b)) return -1;
      if (!removed(a) && removed(b)) return 1;
      return 0;
    });
  }

  return items;
}

export function merge(company, dbItems, apiItems, { sort, query = null }) {
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
    const item = { ...db, _db: true, _api: !!api, storage };
    mergedItems.push(item);
    if (api && !following.has(api)) following.set(api, item);
  }

  // the scan's variants we don't have: to be added to our product following theirs, or as a product of its own
  for (const api of apiItems) {
    const fresh = api.storage.filter((s) => !ours.has(s.api_color_code)).map((s) => ({ ...s, _db: false, _api: true }));
    const item = following.get(api);
    if (item) item.storage.push(...fresh);
    else if (fresh.length || !api.storage.length) mergedItems.push({ ...api, _db: false, _api: true, storage: fresh });
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

  sortItems(mergedItems, sort);
  const queriedItems = queryItems(mergedItems, query);
  return queriedItems.map((item, i) => ({
    ...item,
    _index: i,
    storage: item.storage.map((s, j) => ({
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
