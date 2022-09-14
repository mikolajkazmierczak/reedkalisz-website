import { writable } from 'svelte/store';
import api from '$lib/api';
import fields from '$lib/fields';

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
  { collection: 'global_margins', store: globalMargins, fields: null },
  { collection: 'categories', store: categories, fields: fields.categories.read },
  { collection: 'colors', store: colors, fields: fields.colors.read }
];

export async function updateGlobal(store, ids = []) {
  // update a global store with new items from the api
  if (!Array.isArray(ids)) ids = [ids];
  const collection = collections.find(c => c.store === store);
  if (ids.length > 0) {
    const updated = (await api.items(collection.collection).readMany(ids)).data;
    store.update(items => {
      const unchanged = items.filter(item => !ids.includes(item.id));
      return [...unchanged, ...updated];
    });
  } else {
    const items = (await api.items(collection.collection).readByQuery({ limit: -1, fields: collection.fields })).data;
    store.set(items);
  }
}
