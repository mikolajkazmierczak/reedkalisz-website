import { afterNavigate, goto } from '$app/navigation';
import { page } from '$app/stores';
import { get, writable } from 'svelte/store';

export const searchparams = writable(
  new Map([
    ['/admin/produkty', { values, defaults: { l: 25, p: 1, q: null, c: null } }], // limit, page, query, category
    ['/admin/kategorie', { values, defaults: { q: null } }], // query
    ['/admin/biblioteka', { values, defaults: { l: 25, p: 1, q: null } }] // limit, page, query
  ])
);

function update(pathname, func) {
  searchparams.update(store => {
    const item = store.get(pathname);
    func(item);
    store.set(pathname, item);
    return store;
  });
}

function values() {
  // Return an object with all values for each param.
  // Returns default values if a manager was not instantiated.
  if (Object.hasOwn(this, 'params')) {
    return Object.values(this.params);
  } else {
    return Object.values(this.defaults);
  }
}

export class SearchParamsManager {
  constructor(pathname, refresh = false) {
    this.pathname = pathname;
    this.init(refresh);

    this.updateURL();
    afterNavigate(() => this.updateURL());
  }

  init(refresh) {
    const item = get(searchparams).get(this.pathname);
    if (!item) throw new Error(`No searchparams for "${this.pathname}"`);
    if (!Object.hasOwn(item, 'params') || refresh) {
      update(this.pathname, item => {
        item.params = { ...item.defaults };
      });
    }
  }

  updateURL() {
    // default       | current       | in   -> out
    // --------------------------------------------------
    // {c:null, p:1} | {c:null, p:1} | ?p=2 -> ?p=2
    // {c:null, p:1} | {c:null, p:2} |      -> ?p=2
    // {c:null, p:1} | {c:null, p:1} |      -> ?p=1
    // --------------------------------------------------
    // {c:null}      | {c:null}      | ?c=1 -> ?c=1
    // {c:null}      | {c:1}         | ?c=2 -> ?c=2
    // {c:null}      | {c:2}         |      ->
    // {c:null}      | {c:null}      |      ->

    const url = get(page).url;
    if (this.pathname != url.pathname) return;

    const { defaults, params } = this.get();
    const newParams = SearchParamsManager.parse(url.search);

    // const unsetByDefault = Object.values(defaults).every(v => v == null);
    const unset = Object.keys(newParams).length === 0; // newParams == {}
    if (unset) {
      const paramsUnset = Object.values(params).filter(v => v != null).length === 0;
      if (paramsUnset) return; // ? -> ?
      this.writeURL(params); // ? -> ?p=1
    } else {
      // enforces defaults above nulls
      // TODO: enforces defaults value types (number -> number, string -> string)
      // TODO: ?param=# sets param to null
      // ?p=2&x=2 -> ?p=2&x=2
      // ?p=1     -> ?p=1&x=3 (defaults.x is 3)W
      this.set({ ...defaults, ...params, ...newParams });
    }
  }

  writeURL(newParams) {
    // update url with params (if current pathname is correct)
    // null -> remove param from url
    const url = get(page).url;
    if (this.pathname != url.pathname) return;
    console.log('writeURL', newParams);

    for (const [key, value] of Object.entries(newParams)) {
      if (value == null) url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    }
    goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
  }

  update(newParams) {
    // update searchparams store with params
    update(this.pathname, ({ params }) => {
      for (const [key, value] of Object.entries(newParams)) {
        if (!Object.hasOwn(params, key)) throw new Error(`Provided search param "${key}" is invalid.`);
        params[key] = value;
      }
    });
  }

  containsChanges(newParams) {
    // Return true if any param is different from the same param in defaults.
    const current = this.get().params;
    for (const key in newParams) {
      if (newParams[key] != current[key]) {
        return true;
      }
    }
    return false;
  }

  set(newParams) {
    const changed = this.containsChanges(newParams);
    if (changed) {
      this.update(newParams);
      this.writeURL(newParams);
    }
  }

  get(key = null) {
    // Return a param OR all params and values function from searchparams store.
    // key == null -> all
    const item = get(searchparams).get(this.pathname);
    const { params, defaults, values } = item;
    if (key) return item.params[key];
    return { params, defaults, values };
  }

  static parse(search) {
    // Parse URL and return an object with the specified search params.
    // `search`: '?number=42&string=excalibur' -> { number: 42, string: 'excalibur' }
    const searchParams = new URLSearchParams(search);
    const keys = searchParams.keys();
    const params = {};
    for (const key of keys) {
      const v = searchParams.get(key);
      params[key] = v ? (isNaN(Number(v)) ? v : Number(v)) : null;
    }
    return params;
  }

  static read() {
    const url = get(page).url;
    return SearchParamsManager.parse(url.search);
  }
}
