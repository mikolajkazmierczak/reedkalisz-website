import { get, writable } from 'svelte/store';
import api from '$/api';
import fields from '$/fields';

// Global arrays of items from their respective collections:
// - global because they are needed on many pages in the app, so redownlading them every time is pointless
// - first loaded on load of one the pages that need them, then updated when Heimdall detects an update
// - pages that need a certain store are listed in comments below
// TODO: update the lists below when new pages are added
export const users = writable(null); // virtually everywhere
export const companies = writable(null); // /produkty/:slug, /kalkulacje
export const labelings = writable(null); // /produkty/:slug, /kalkulacje
export const priceViews = writable(null); // /produkty/:slug, /kalkulacje
export const globalMargins = writable(null); // /produkty/:slug, /kalkulacje
export const categories = writable(null); // /produkty, /produkty/:slug
export const colors = writable(null); // /produkty/:slug

export const collections = [
  { name: 'directus_users', store: users, fields: fields.users.read },
  { name: 'companies', store: companies, fields: fields.companies.read },
  { name: 'labelings', store: labelings, fields: fields.labelings.read },
  { name: 'price_views', store: priceViews, fields: fields.price_views.read },
  { name: 'global_margins', store: globalMargins, singleton: true },
  { name: 'categories', store: categories, fields: fields.categories.read },
  { name: 'colors', store: colors, fields: fields.colors.read }
];

function updateArray(items, updated, sortingKey) {
  let needsSorting = false;
  // update existing items and add new ones
  for (const item of updated) {
    const index = items.findIndex(i => i.id == item.id);
    if (index != -1) {
      items[index] = item;
    } else {
      items.push(item);
      needsSorting = true;
    }
  }
  // filter items that were deleted
  items = items.filter(item => updated.find(u => u.id === item.id));
  // sort by the given key
  if (needsSorting) items.sort((a, b) => a[sortingKey] - b[sortingKey]);
  return items;
}

export async function updateGlobal(store, { ids = null, refresh = false, sortingKey = 'id' } = {}) {
  // Read items from the API to a global store (if NOT POPULATED already).
  // `refresh`: update all items if POPULATED already
  // `ids`: update selected items if POPULATED already
  const isPopulated = get(store) != null;
  if (isPopulated && (!ids || !refresh)) return;

  const { name, fields, singleton } = collections.find(c => c.store === store);
  // console.log('$globals UPDATE:', name, fields, singleton, ids, refresh);

  if (ids) {
    // only update specified ids
    const updated = (await api.items(name).readMany(ids, { fields })).data;
    store.update(items => updateArray(items, updated, sortingKey));
  } else {
    if (singleton) {
      // read singleton
      const item = await api.singleton(name).read({ fields });
      store.set(item);
    } else {
      // update all items
      const items = (await api.items(name).readByQuery({ fields, limit: -1 })).data;
      store.set(items);
    }
  }
}

export const globals = { users, companies, labelings, priceViews, globalMargins, categories, colors };
export default { updateGlobal, globals };
