// Recalculates the price lists of the products whose saved prices aren't what the admin would save now: a flag set
// without recalculating, a margin changed while a recalculation failed... Each product is worked out in memory with
// the admin's own code (shared/calculations.js), compared with what's saved, and only the ones that differ are written.
//
//   node scripts/recalculate.mjs           # dry run: prints what would change
//   node scripts/recalculate.mjs --apply   # writes them
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env). Also the
// last step of `migrate-sections.mjs`.

import fs from 'fs';
import path from 'path';
import { register } from 'module';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// the shared files import each other without ".js" (the bundler adds it): so does this hook
register(
  'data:text/javascript,' +
    encodeURIComponent(
      `export async function resolve(s, c, next) {
        if (s.startsWith('.') && !/\\.[a-z]+$/.test(s)) try { return await next(s + '.js', c); } catch {}
        return next(s, c);
      }`,
    ),
);
const { recalculateProducts } = await import('../shared/calculations.js');
const { default: fields } = await import('../shared/fields/index.js');
const { calculate } = await import('../shared/fields/products.js');

function connect() {
  const env = Object.fromEntries(
    fs
      .readFileSync(path.join(root, 'backend/heimdall/.env'), 'utf8')
      .split('\n')
      .filter((line) => /^[A-Z_]+=/.test(line))
      .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1).trim()]),
  );
  const headers = { Authorization: `Bearer ${env.DIRECTUS_TOKEN}`, 'Content-Type': 'application/json' };
  return async function call(method, url, body) {
    const res = await fetch(`${env.API}${url}`, { method, headers, body: body && JSON.stringify(body) });
    if (!res.ok) throw new Error(`${method} ${url}: ${res.status} ${await res.text()}`);
    return res.status === 204 ? null : (await res.json()).data;
  };
}

const query = (params) =>
  Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(typeof v === 'string' ? v : JSON.stringify(v))}`)
    .join('&');

// what a recalculation decides, comparable: every price's amount, price and whether it's shown, the min and max
const cents = (n) => (n == null ? null : Math.round(Number(n) * 100));
const ladder = (prices, shown = true) =>
  (prices ?? []).map((p) => [p.amount, cents(p.price), shown && !!p.enabled]).sort((a, b) => a[0] - b[0]);
// (`shown`: false keeps only the prices themselves, to tell apart the ones whose prices changed)
const outcome = (p, shown = true) =>
  JSON.stringify({
    custom: ladder(p.custom_prices, shown),
    customSale: ladder(p.custom_prices_sale, shown),
    labelings: (p.labelings ?? [])
      .map((l) => ({
        id: l.id,
        labeling: l.labeling,
        prices: ladder(l.prices, shown),
        sale: ladder(l.prices_sale, shown),
      }))
      .sort((a, b) => a.id - b.id),
    ...(shown && {
      view: p.price_view,
      min: cents(p.price_min),
      max: cents(p.price_max),
      minSale: cents(p.price_min_sale),
      maxSale: cents(p.price_max_sale),
    }),
  });

/** -> the ids of the products that needed it (written with `apply`) */
export async function recalculateStale({ call = connect(), apply = false, log = console.log } = {}) {
  const read = (collection) =>
    call('GET', `/items/${collection}?${query({ fields: fields[collection].read.join(','), limit: -1 })}`);
  const globals = {
    companies: await read('companies'),
    labelings: await read('labelings'),
    priceViews: await read('price_views'),
    globalMargins: await call('GET', '/items/global_margins'),
  };
  const defaultView = globals.priceViews.find((v) => v.default)?.id;

  // what the recalculation reads, and the prices' values too (to compare)
  const productFields = [
    ...calculate,
    ...['custom_prices', 'custom_prices_sale', 'labelings.prices', 'labelings.prices_sale'].flatMap((f) => [
      `${f}.amount`,
      `${f}.price`,
    ]),
  ];
  const products = await call('GET', `/items/products?${query({ fields: productFields.join(','), limit: -1 })}`);
  log(`${products.length} products, recalculating each in memory...`);

  const stale = [];
  const failed = [];
  for (const saved of products) {
    const product = structuredClone(saved);
    product.price_view ??= defaultView; // (as the editor does, opening one without a view)
    let updates;
    // an API that hands over this one product and keeps what would be written, instead of writing it
    const memory = {
      items: () => ({
        readByQuery: async () => ({ data: [product] }),
        updateOne: async (id, u) => (updates = u),
      }),
    };
    try {
      const realLog = console.log;
      console.log = () => {}; // (the shared code narrates every run)
      try {
        await recalculateProducts(memory, null, globals);
      } finally {
        console.log = realLog;
      }
    } catch (e) {
      failed.push(`${saved.id}: ${e.message}`);
      continue;
    }
    const now = { ...saved, ...updates };
    if (outcome(now) !== outcome(saved))
      stale.push({ id: saved.id, updates, priced: outcome(now, false) !== outcome(saved, false) });
  }

  const priced = stale.filter((s) => s.priced);
  const example = (list) =>
    list.length
      ? ` (e.g. #${list
          .slice(0, 8)
          .map((s) => s.id)
          .join(', #')})`
      : '';
  log(`${stale.length} need recalculating:`);
  log(
    `  ${stale.length - priced.length} only switch prices on or off (and their min/max)${example(stale.filter((s) => !s.priced))}`,
  );
  log(`  ${priced.length} get new prices${example(priced)}`);
  if (failed.length) log(`${failed.length} couldn't be recalculated (left as they are):\n  ${failed.join('\n  ')}`);
  if (apply) {
    let done = 0;
    for (const { id, updates } of stale) {
      await call('PATCH', `/items/products/${id}`, updates);
      if (++done % 100 === 0) log(`  ${done}/${stale.length}`);
    }
    log(`${done} recalculated`);
  }
  return stale.map((s) => s.id);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const apply = process.argv.includes('--apply');
  console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');
  await recalculateStale({ apply });
  console.log(apply ? '\ndone' : '\nnothing was changed');
}
