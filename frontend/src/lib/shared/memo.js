import { writable } from 'svelte/store';

// What's kept in this browser (localStorage): conveniences, not data - they may be gone (a private window, the storage
// blocked or cleared), so a read falls back and a write that fails isn't kept (it lasts while the page is open).
// Values are kept as JSON; a string can be kept as it is (`raw`), for what someone else reads (Umami) or what was
// written so before.

export function readMemo(key, fallback = null, { raw = false } = {}) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    return raw ? value : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function writeMemo(key, value, { raw = false } = {}) {
  try {
    localStorage.setItem(key, raw ? value : JSON.stringify(value));
  } catch {
    // not kept
  }
}

// a store of it: what's kept (or `fallback`: nothing kept, or what's kept isn't `valid` any more, e.g. an option since
// gone), every value it's set to kept
export function memo(key, fallback, { valid = () => true, raw = false } = {}) {
  const kept = readMemo(key, fallback, { raw });
  const store = writable(valid(kept) ? kept : fallback);
  store.subscribe((value) => writeMemo(key, value, { raw }));
  return store;
}
