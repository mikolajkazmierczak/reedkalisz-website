import { writable, get } from 'svelte/store';

export let selected = writable(new Set()); // [uid] uids both for items and storages (generated with nanoid)

export function countSelected(items) {
  // count the number of selected items and storages
  // return { items: 1, storages: 2, all: 3 };
  if (!items) return { items: 0, storages: 0, all: 0 };
  let itemsCount = 0;
  let storagesCount = 0;
  for (const item of items) {
    if (get(selected).has(item._uid)) {
      itemsCount++;
      storagesCount += item.storage.filter(s => get(selected).has(s._uid)).length;
    }
  }
  return { items: itemsCount, storages: storagesCount, all: itemsCount + storagesCount };
}

export function clearSelected() {
  selected.update(() => new Set());
}

export function toggleItemSelected(item) {
  // toggle the selection of an item and all it's storages
  // changes `selected` array in place
  if (get(selected).has(item._uid)) {
    // deselect item and all it's storages
    get(selected).delete(item._uid);
    item.storage.forEach(s => get(selected).delete(s._uid));
  } else {
    // select item and all it's storages
    get(selected).add(item._uid);
    item.storage.forEach(s => {
      if (s._db) return; // skip storages already in db
      get(selected).add(s._uid);
    });
  }
  selected.update(s => new Set(s));
}

export function toggleStorageSelected(item, storage) {
  // toggle the selection of a storage (and possibly it's item)
  // changes `selected` array in place
  if (get(selected).has(storage._uid)) {
    // deselect storage (and item if all it's storages are deselected)
    get(selected).delete(storage._uid);
    const allDeselected = item.storage.every(s => !get(selected).has(s._uid));
    if (allDeselected) get(selected).delete(item._uid);
  } else {
    // select storage and item
    get(selected).add(storage._uid);
    get(selected).add(item._uid);
  }
  selected.update(s => new Set(s));
}
