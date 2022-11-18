import { writable } from 'svelte/store';
import api from '$/api';
import fields from '$/fields';

// global arrays of items from their respective collections:
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
  { collection: 'directus_users', store: users, fields: fields.users.read },
  { collection: 'companies', store: companies, fields: fields.companies.read },
  { collection: 'labelings', store: labelings, fields: fields.labelings.read },
  { collection: 'price_views', store: priceViews, fields: fields.price_views.read },
  { collection: 'global_margins', store: globalMargins, fields: null, singleton: true },
  { collection: 'categories', store: categories, fields: fields.categories.read },
  { collection: 'colors', store: colors, fields: fields.colors.read }
];

export async function updateGlobal(store, ids = null, options = { filter: null, search: null }) {
  // update a global store with new items from the api
  const collection = collections.find(c => c.store === store);

  const params = { fields: collection.fields };
  if (options.filter) params.filter = options.filter;
  if (options.search) params.search = options.search;

  if (collection?.singleton) {
    // get singleton
    const item = await api.singleton(collection.collection).read();
    store.set(item);
  } else if (ids) {
    // only update specified ids
    const updated = (await api.items(collection.collection).readMany(ids, params)).data;
    store.update(items => {
      let needsSorting = false;
      for (const u of updated) {
        const i = items.findIndex(item => item.id === u.id);
        if (i > -1) {
          // update existing item
          items[i] = u;
        } else {
          // add new item
          items.push(u);
          needsSorting = true;
        }
      }
      if (needsSorting) items.sort((a, b) => a.id - b.id);
      return items;
    });
  } else {
    // update all items
    if (params.search === null) params.limit = -1;
    const items = (await api.items(collection.collection).readByQuery(params)).data;
    store.set(items);
  }
}

export default { updateGlobal, users, companies, labelings, priceViews, globalMargins, categories, colors };
