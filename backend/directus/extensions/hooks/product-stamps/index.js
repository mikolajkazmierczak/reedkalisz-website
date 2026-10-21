//
// A product's "Aktualizacja" is its last manual edit: user_updated / date_updated are plain fields on products (no
// Directus specials, see scripts/migrate-stamps.mjs), stamped here instead - otherwise every scan and recalculation
// would stamp them too.
// - a write as heimdall (a scan's or a recalculation's, sent through heimdall's proxy: backend/heimdall/directus.js)
//   leaves them as they are; the scan's `scanned_at` and the recalculation's `recalculated_at` get the server's time
// - anyone else's (the panel, the Directus app) stamps them as the specials did; the automatic dates are heimdall's
// HEIMDALL_USER (.env) is the heimdall user's id: without it every write is a manual one, as before.
//
// CommonJS: Directus 9.26 import()s this file and takes its default export (module.exports).
//

const manual = ['date_updated', 'user_updated'];
const automatic = ['scanned_at', 'recalculated_at'];

module.exports = function registerHook({ filter }, { env, logger }) {
  const heimdall = env.HEIMDALL_USER;
  if (!heimdall) logger.warn('product-stamps: HEIMDALL_USER is not set, every product write counts as a manual one');

  filter('products.items.update', (payload, meta, { accountability }) => {
    if (!accountability) return payload; // (Directus' own, nobody's)
    const now = new Date().toISOString();
    const stamped = { ...payload };
    if (heimdall && accountability.user === heimdall) {
      for (const field of manual) delete stamped[field];
      for (const field of automatic) if (field in stamped) stamped[field] = now;
    } else {
      for (const field of automatic) delete stamped[field];
      Object.assign(stamped, { date_updated: now, user_updated: accountability.user ?? null });
    }
    return stamped;
  });
};
