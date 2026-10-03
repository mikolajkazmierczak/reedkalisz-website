#!/usr/bin/env node
//
// Every product's variants and labelings in their order (see shared/order.js): the product editor and the API import
// set it from now on, this puts the ones saved before in it too (the site shows them by `index`).
//
//   node scripts/sort-rows.mjs           # dry run: prints what would change
//   node scripts/sort-rows.mjs --apply   # makes the changes
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env; `API=...`
// in the environment points it elsewhere, e.g. a test copy), never the database file. "Aktualizacja" stays as it is:
// the fields that stamp it are switched off for the updates, and back on after them.
//
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sortLabelings, sortVariants } from '../shared/order.js';

const apply = process.argv.includes('--apply');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, 'backend/heimdall/.env'), 'utf8')
    .split('\n')
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1).trim()]),
);
const API = process.env.API || env.API;
const headers = { Authorization: `Bearer ${env.DIRECTUS_TOKEN}`, 'Content-Type': 'application/json' };

async function call(method, url, body) {
  const res = await fetch(`${API}${url}`, { method, headers, body: body && JSON.stringify(body) });
  if (!res.ok) throw new Error(`${method} ${url}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : (await res.json()).data;
}

// runs `update` with the collection's "Aktualizacja" stamps switched off; put back with their own value even if a run
// was killed before (a field still without it - left so by that run - gets it back too)
async function unstamped(collection, update) {
  const stamps = { date_updated: 'date-updated', user_updated: 'user-updated' };
  const specials = {};
  for (const [f, stamp] of Object.entries(stamps)) {
    const special = (await call('GET', `/fields/${collection}/${f}`)).meta?.special ?? [];
    specials[f] = special.includes(stamp) ? special : [stamp, ...special];
  }
  const restore = async () => {
    for (const f of Object.keys(stamps))
      await call('PATCH', `/fields/${collection}/${f}`, { meta: { special: specials[f] } });
  };
  const interrupted = () => restore().finally(() => process.exit(130));
  process.once('SIGINT', interrupted);
  try {
    for (const [f, stamp] of Object.entries(stamps)) {
      const special = specials[f].filter((s) => s !== stamp);
      await call('PATCH', `/fields/${collection}/${f}`, { meta: { special } });
    }
    await update();
  } finally {
    process.off('SIGINT', interrupted);
    await restore();
  }
}

console.log(`${apply ? 'APPLYING' : 'DRY RUN (add --apply to make the changes)'} on ${API}\n`);

const labelings = await call('GET', '/items/labelings?fields=id,company,index&limit=-1');
const fields = [
  'id',
  'code',
  'company',
  'storage.id',
  'storage.index',
  'storage.api_color_code',
  'labelings.id',
  'labelings.index',
  'labelings.labeling',
  'labelings.labeling_field_x',
  'labelings.labeling_field_y',
  'labelings.labeling_place',
].join(',');
const deep = encodeURIComponent(
  JSON.stringify({
    storage: { _sort: ['index', 'id'], _limit: -1 },
    labelings: { _sort: ['index', 'id'], _limit: -1 },
  }),
);
const products = await call('GET', `/items/products?fields=${fields}&deep=${deep}&limit=-1`);

// the rows whose place changes -> [{ id, index }]
const moved = (rows, sort) => {
  const before = new Map(rows.map((r) => [r.id, r.index]));
  return sort(rows.map((r) => ({ ...r })))
    .filter((r) => before.get(r.id) !== r.index)
    .map(({ id, index }) => ({ id, index }));
};

// a product's rows in another order (not just numbered afresh: gaps, none)
const reordered = (rows, sort) => {
  const ids = rows.map((r) => r.id).join();
  return (
    sort(rows.map((r) => ({ ...r })))
      .map((r) => r.id)
      .join() !== ids
  );
};

const changes = { products_storage: [], products_labeling: [] };
const touched = { products_storage: [0, 0], products_labeling: [0, 0] }; // [reordered, only renumbered]
const examples = [];
for (const p of products) {
  const sortThem = (rows) => sortLabelings(rows, labelings, p.company);
  for (const [collection, rows, sort] of [
    ['products_storage', p.storage ?? [], sortVariants],
    ['products_labeling', p.labelings ?? [], sortThem],
  ]) {
    const rowsMoved = moved(rows, sort);
    if (!rowsMoved.length) continue;
    changes[collection].push(...rowsMoved);
    touched[collection][reordered(rows, sort) ? 0 : 1]++;
  }
  if (reordered(p.storage ?? [], sortVariants) && examples.length < 10) {
    const codes = (rows) => rows.map((s) => s.api_color_code || '—').join(', ');
    const sorted = sortVariants((p.storage ?? []).map((s) => ({ ...s })));
    examples.push(`  ${p.code}: ${codes(p.storage)}\n  ${' '.repeat(p.code.length)}  -> ${codes(sorted)}`);
  }
}
const line = (what, collection) =>
  `${what}: ${touched[collection][0]} products in another order, ${touched[collection][1]} only renumbered ` +
  `(${changes[collection].length} rows)`;
console.log(`${products.length} products`);
console.log(line('variants', 'products_storage'));
console.log(line('labelings', 'products_labeling'));
if (examples.length) console.log(`\nfor example:\n${examples.join('\n')}`);

if (apply) {
  for (const [collection, rows] of Object.entries(changes)) {
    if (!rows.length) continue;
    await unstamped(collection, async () => {
      for (let i = 0; i < rows.length; i += 100) await call('PATCH', `/items/${collection}`, rows.slice(i, i + 100));
    });
  }
}

console.log(apply ? '\ndone' : '\nnothing was changed');
