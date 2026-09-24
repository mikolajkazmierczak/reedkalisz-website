import { dev } from '$app/environment';

const entries = new Map();

/** Half of the 60 s a change may take to show; Cloudflare's copy (hooks.server.js) has the other half. */
export const SERVER_MAX_AGE = 30 * 1000;

/**
 * `fn()`'s result, never served older than `maxAge` ms. Past half of that it's still served, instantly, while
 * one refresh runs behind it; past all of it the request waits for a fresh one. Off in dev, so edits show.
 */
export function cached(key, maxAge, fn) {
  if (dev) return fn();
  const entry = entries.get(key);
  const age = entry ? Date.now() - entry.at : Infinity;
  if (age < maxAge / 2) return entry.value;
  if (age < maxAge) {
    if (!entry.refreshing) refresh(key, fn, entry).catch(() => {});
    return entry.value;
  }
  return entry?.refreshing ?? refresh(key, fn, entry);
}

function refresh(key, fn, entry) {
  const request = fn()
    .then(
      (value) => {
        entries.set(key, { at: Date.now(), value: Promise.resolve(value) });
        return value;
      },
      (err) => {
        if (!entry) entries.delete(key); // nothing to fall back on: the next request tries again
        throw err;
      },
    )
    .finally(() => {
      if (entry) entry.refreshing = null;
    });
  if (entry) entry.refreshing = request;
  else entries.set(key, { at: -Infinity, value: request, refreshing: request });
  return request;
}
