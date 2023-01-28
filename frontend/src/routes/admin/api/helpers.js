import { slugify } from '%/utils';

export function countSelected(selected) {
  // remove duplicates and count
  return [...new Set(selected)].length;
}

function findColor(colors, str) {
  return colors.find(c => slugify(c.name) == slugify(str));
}
export function findColorID(colors, str) {
  return findColor(colors, str)?.id ?? null;
}

function parseColor(colors, q) {
  // q: id or name (int or string)
  // find a color in $colors by id or by comparing slugified names - if not found return `[nowy] query`
  if (q === '' || q === null || q === undefined) return null;
  const color = typeof q == 'string' ? findColor(colors, q) : colors.find(c => c.id == q);
  return color ? color.name : `[${q}]`;
}
export function parseColors(colors, q) {
  // q: [id or name (int or string)]
  // find colors in $colors by id or by comparing slugified names - if not found return `[nowy] query`
  if (!q) return '';
  return q
    .map(c => parseColor(colors, c))
    .filter(Boolean)
    .join(' / ');
}

function queryItems(items, query = null) {
  // query items by name or code
  if (!query) return items;
  return items.filter(item => {
    const name = slugify(item.name);
    const code = slugify(item.code);
    const q = slugify(query);
    return name.includes(q) || code.includes(q);
  });
}

function sortItems(items, nameFirst = true, dbFirst = true) {
  // sort by name (str) and code (str)
  // if nameFirst sort first by name, then by code (or the other way around)
  // if dbFirst put items that have an id first (or dont take it into account at all)
  if (!items) return;
  items.sort((a, b) => {
    if (dbFirst) {
      if (a.id && !b.id) return -1;
      if (!a.id && b.id) return 1;
    }
    if (nameFirst) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      if (a.code < b.code) return -1;
      if (a.code > b.code) return 1;
    } else {
      if (a.code < b.code) return -1;
      if (a.code > b.code) return 1;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
    }
    return 0;
  });
}

export function merge(dbItems, apiItems, { nameFirst = true, dbFirst = true, query = null } = {}) {
  if (!dbItems || !apiItems) return null;

  const dbCodes = dbItems.map(db => db.code);
  const output = [];

  for (const db of dbItems) {
    const api = apiItems.find(i => i.code == db.code);
    const storage = mergeStorages(db.storage, api?.storage ?? []);
    output.push({ ...db, _api: !!api, storage });
  }

  for (const api of apiItems) {
    if (!dbCodes.includes(api.code)) {
      const storage = api.storage.map(s => ({ ...s, _api: true }));
      output.push({ ...api, _api: true, storage });
    }
  }

  sortItems(output, nameFirst, dbFirst);
  const queriedOutput = queryItems(output, query);
  return queriedOutput.map((item, i) => ({
    ...item,
    _index: i,
    storage: item.storage.map((s, i) => ({ ...s, _index: i }))
  }));
}

function mergeStorages(dbStorage, apiStorage) {
  const dbCodes = dbStorage.map(s => s.api_color_code);
  const output = [];

  for (const db of dbStorage) {
    const api = apiStorage.find(api => api.api_color_code == db.api_color_code);
    output.push({ ...db, _api: !!api });
  }

  for (const api of apiStorage) {
    if (!dbCodes.includes(api.api_color_code)) {
      output.push({ ...api, _api: true });
    }
  }

  return output;
}
