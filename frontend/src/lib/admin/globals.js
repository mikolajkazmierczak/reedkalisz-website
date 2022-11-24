import { get, writable } from 'svelte/store';
import api from '$/api';
import { default as collectionsFields } from '$/fields';

// Global arrays of items from their respective collections:
// - global because they are needed on many pages in the app, so redownlading them every time is pointless
// - first loaded on load of one the pages that need them, then updated when Heimdall detects an update
// - pages that need a certain store are listed in comments below
// TODO: update the lists below
export const users = writable(null); // virtually everywhere
export const companies = writable(null); // /produkty/:slug, /kalkulacje
export const labelings = writable(null); // /produkty/:slug, /kalkulacje
export const priceViews = writable(null); // /produkty/:slug, /kalkulacje
export const globalMargins = writable(null); // /produkty/:slug, /kalkulacje
export const categories = writable(null); // /produkty, /produkty/:slug
export const colors = writable(null); // /produkty/:slug
export const menus = writable(null);
export const menuItems = writable(null);

const collections = [
  { collection: 'directus_users', store: users },
  { collection: 'companies', store: companies },
  { collection: 'labelings', store: labelings },
  { collection: 'price_views', store: priceViews },
  { collection: 'global_margins', store: globalMargins, singleton: true },
  { collection: 'categories', store: categories },
  { collection: 'colors', store: colors },
  { collection: 'menus', store: menus },
  { collection: 'menu_items', store: menuItems }
];

async function updateItemsWithIDs(store, collection, ids, sortingKey, fields) {
  // only update specified ids
  const updated = (await api.items(collection).readMany(ids, { fields })).data;
  const deletedIDs = ids.filter(id => !updated.find(item => item.id == id));
  store.update(items => {
    let needsSorting = false;
    // update existing items and add new ones
    for (const u of updated) {
      const index = items.findIndex(i => i.id == u.id);
      if (index != -1) {
        items[index] = u;
      } else {
        items.push(u);
        needsSorting = true;
      }
    }
    // filter items that were deleted
    const itemsLength = items.length;
    items = items.filter(i => !deletedIDs.includes(i.id));
    if (items.length != itemsLength) needsSorting = true;
    // sort by the given key
    if (needsSorting) items.sort((a, b) => a[sortingKey] - b[sortingKey]);
    return items;
  });
}

async function updateAllItems(store, collection, fields) {
  // update all items
  const items = (await api.items(collection).readByQuery({ fields, limit: -1 })).data;
  store.set(items);
}

class Globals {
  constructor() {
    this.collections = collections.map(c => c.collection);
    this.stores = collections.map(c => c.store);
    // this.queue = []; // TODO: queue of the updates requested, to avoid unnecessary multiple updates
  }

  update = async (global, { ids = null, refresh = false, sortingKey = 'id' } = {}) => {
    // Read items from the API to a global store (if NOT POPULATED already).
    // `global` can be a string (collection) or an object (store)
    // `ids`: update selected items if POPULATED already
    // `refresh`: update all items if POPULATED already
    // `sortingKey`: key to sort the items by after updating (when needed)

    const store = typeof global === 'string' ? collections.find(c => c.collection === global).store : global;

    const isPopulated = get(store) != null;
    const shouldRead = !isPopulated && !ids && !refresh; // not populated AND neither ids nor refresh given
    const shouldUpdate = isPopulated && (ids || refresh); // populated AND either ids or refresh given
    // console.log('$globals update:', global, { ids, refresh, sortingKey }, shouldRead);
    if (!(shouldRead || shouldUpdate)) return;

    const { collection, singleton } = collections.find(c => c.store === store);

    // console.log('$globals read:', collection, ids, refresh);
    if (singleton) {
      // update singleton
      store.set(await api.singleton(collection).read());
    } else {
      const fields = collectionsFields[collection].read;
      if (ids) {
        updateItemsWithIDs(store, collection, ids, sortingKey, fields);
      } else await updateAllItems(store, collection, fields);
    }
  };
}

export const globals = new Globals();
export default globals;
