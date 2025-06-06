import { getUid } from '%/uid';

function queryItems(items, query = null) {
  // query items name, code, storage color names and storage color code
  if (!query) return items;
  query = decodeURIComponent(query).toLowerCase(); // decode query
  return items.filter(item => {
    // constructs a long string of item data to search in, not pretty but functional
    const str = value => (value ? String(value) : '');
    const storageString = item.storage
      .map(s => str(s.color_first) + str(s.color_second) + str(s.api_color_code ?? '???'))
      .join('');
    const itemString = str(item.name) + str(item.code ?? '???') + storageString;
    return itemString.toLowerCase().includes(query);
  });
}

function sortItems(items, sort) {
  // if sortNameFirst sort first by name, then by code (or the other way around)
  // if sortDbFirst bubble items that have an id
  // if sortRemovedFirst bubble items that don't have _api

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
    const removed = item => !item._api || item.storage.some(s => !s._api);
    items.sort((a, b) => {
      if (removed(a) && !removed(b)) return -1;
      if (!removed(a) && removed(b)) return 1;
      return 0;
    });
  }

  return items;
}

function mergeStorages(dbStorage, apiStorage) {
  const storages = [];

  // check if storages are still in the api
  for (const db of dbStorage) {
    const api = apiStorage.find(s => s.api_color_code == db.api_color_code);
    storages.push({ ...db, _db: true, _api: !!api });
  }

  // add storages that are only in the api
  const dbCodes = dbStorage.map(s => s.api_color_code);
  for (const api of apiStorage) {
    if (dbCodes.includes(api.api_color_code)) continue; // skip storages already in db
    storages.push({ ...api, _db: false, _api: true });
  }

  return storages;
}

export function merge(company, dbItems, apiItems, { sort, query = null }) {
  if (!company || !dbItems || !apiItems) return;
  const mergedItems = [];

  // check if items are still in the api
  // and add storages that are only in the api
  for (const db of dbItems) {
    const api = apiItems.find(i => i.code === db.code);
    const storage = mergeStorages(db.storage, api?.storage ?? []);
    mergedItems.push({ ...db, _db: true, _api: !!api, storage });
  }

  // add items that are only in the api (and their storages)
  const dbCodes = dbItems.map(i => i.code);
  for (const api of apiItems) {
    if (dbCodes.includes(api.code)) continue; // skip items already in db
    const storage = api.storage.map(s => ({ ...s, _db: false, _api: true }));
    mergedItems.push({ ...api, _db: false, _api: true, storage });
  }

  sortItems(mergedItems, sort);
  const queriedItems = queryItems(mergedItems, query);
  return queriedItems.map((item, i) => ({
    ...item,
    _uid: getUid(company.name, item),
    _index: i,
    storage: item.storage.map((s, j) => ({
      ...s,
      _uid: getUid(company.name, item, s),
      _index: j
    }))
  }));
}
