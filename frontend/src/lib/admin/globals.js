import { get, writable } from 'svelte/store';
import api from '$/api';
import { default as collectionsFields } from '%/fields';

// Global arrays of items from their respective collections:
// - global because they are needed on many pages in the app, so redownlading them every time is pointless
// - first loaded on load of one the pages that need them, then updated when Heimdall detects an update
export const users = writable(null);
export const companies = writable(null);
export const labelings = writable(null);
export const priceViews = writable(null);
export const globalMargins = writable(null);
export const commercialDetails = writable(null);
export const categories = writable(null);
export const colors = writable(null);

const collections = [
  { collection: 'directus_users', store: users },
  { collection: 'companies', store: companies },
  { collection: 'labelings', store: labelings },
  { collection: 'price_views', store: priceViews },
  { collection: 'global_margins', store: globalMargins, singleton: true },
  { collection: 'commercial_details', store: commercialDetails },
  { collection: 'categories', store: categories },
  { collection: 'colors', store: colors },
];

// works for numbers and strings (users have uuids)
const by = (key) => (a, b) => (a[key] > b[key]) - (a[key] < b[key]);

async function updateItemsWithIDs(store, collection, ids, sortingKey, fields) {
  // only update specified ids (as a CSV: Directus reads a url list of more than 20 items as an object, which matches
  // nothing, and every id counted as deleted)
  const filter = { id: { _in: ids.join(',') } };
  const updated = (await api.items(collection).readByQuery({ fields, filter, limit: -1 })).data;
  const deletedIDs = ids.filter((id) => !updated.find((item) => item.id == id));
  store.update((items) => {
    let needsSorting = false;
    // update existing items and add new ones
    for (const u of updated) {
      const index = items.findIndex((i) => i.id == u.id);
      if (index != -1) {
        items[index] = u;
      } else {
        items.push(u);
        needsSorting = true;
      }
    }
    // filter items that were deleted
    const itemsLength = items.length;
    items = items.filter((i) => !deletedIDs.includes(i.id));
    if (items.length != itemsLength) needsSorting = true;
    // sort by the given key
    if (needsSorting) items.sort(by(sortingKey));
    return items;
  });
}

async function updateAllItems(store, collection, fields, sortingKey) {
  // update all items, always in the same order (Directus doesn't promise one without `sort`)
  const items = (await api.items(collection).readByQuery({ fields, limit: -1 })).data;
  store.set(items.sort(by(sortingKey)));
}

async function read(store, ids, sortingKey) {
  const { collection, singleton } = collections.find((c) => c.store === store);

  if (singleton) {
    // update singleton
    store.set(await api.singleton(collection).read());
  } else {
    const fields = collectionsFields[collection].read;
    if (ids) {
      await updateItemsWithIDs(store, collection, ids, sortingKey, fields);
    } else await updateAllItems(store, collection, fields, sortingKey);
  }
}

// first reads still running, by store: a layout and a component in it asking at once share one
const pending = new Map();

class Globals {
  constructor() {
    this.collections = collections.map((c) => c.collection);
  }

  update = async (global, { ids = null, refresh = false, sortingKey = 'id' } = {}) => {
    // Read items from the API to a global store (if NOT POPULATED already).
    // `global` can be a string (collection) or an object (store)
    // `ids`: update selected items if POPULATED already
    // `refresh`: update all items if POPULATED already
    // `sortingKey`: key to sort the items by after updating (when needed)

    const store = typeof global === 'string' ? collections.find((c) => c.collection === global).store : global;

    const isPopulated = get(store) != null;
    const shouldRead = !isPopulated && !ids && !refresh; // not populated AND neither ids nor refresh given
    const shouldUpdate = isPopulated && (ids || refresh); // populated AND either ids or refresh given
    if (!(shouldRead || shouldUpdate)) return;

    if (shouldRead) {
      if (!pending.has(store)) {
        const reading = read(store, null, sortingKey).finally(() => pending.delete(store));
        pending.set(store, reading);
      }
      return pending.get(store);
    }
    await read(store, ids, sortingKey);
  };
}

export const globals = new Globals();
export default globals;
