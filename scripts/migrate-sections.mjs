#!/usr/bin/env node
//
// NOWOŚCI, BESTSELLERY and PROMOCJE stop being categories: the website makes them from the product flags.
//
//   node scripts/migrate-sections.mjs           # dry run: prints what would change
//   node scripts/migrate-sections.mjs --apply   # makes the changes
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env),
// never the database file, so Directus validates and logs it like an edit in the admin panel.
// Run it after the new website is deployed (the old one still lists the categories).
//
// - every product in one of the three categories (or under it) gets its flag (flags already set stay)
// - a product in a subcategory of one of them (e.g. PROMOCJE › Kubki izotermiczne) is put in the category
//   of the same name elsewhere in the tree (JEDZENIE I PICIE › Kubki izotermiczne), so it isn't lost there
// - the three categories and their subcategories are deleted
// - the categories left are numbered again without gaps
// - products without a company get REED (a company is required now)
// - last, products with stale prices are recalculated (the ones flagged sale above among them: the flag alone
//   leaves their sale prices off)
//
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { recalculateStale } from './recalculate.mjs';

const apply = process.argv.includes('--apply');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, 'backend/heimdall/.env'), 'utf8')
    .split('\n')
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1).trim()]),
);
const headers = { Authorization: `Bearer ${env.DIRECTUS_TOKEN}`, 'Content-Type': 'application/json' };

async function call(method, url, body) {
  const res = await fetch(`${env.API}${url}`, { method, headers, body: body && JSON.stringify(body) });
  if (!res.ok) throw new Error(`${method} ${url}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : (await res.json()).data;
}
const query = (params) =>
  Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(typeof v === 'string' ? v : JSON.stringify(v))}`)
    .join('&');
const chunks = (list, size = 100) =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size));

// the same as LEGACY_SLUGS in frontend/src/lib/website/sections.js
const SECTIONS = [
  { slug: 'nowosci-2026-hZs_K3a5', flag: 'new' },
  { slug: 'bestsellery-_26zWCFh', flag: 'bestseller' },
  { slug: 'promocje-AxuA4fDb', flag: 'sale' },
];

console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');

const categories = await call('GET', `/items/categories?${query({ fields: 'id,parent,name,slug', limit: -1 })}`);
const byId = new Map(categories.map((c) => [c.id, c]));
const subtree = (id) => [id, ...categories.filter((c) => c.parent === id).flatMap((c) => subtree(c.id))];
const trail = (id) => {
  const names = [];
  for (let c = byId.get(id); c; c = byId.get(c.parent)) names.unshift(c.name);
  return names.join(' › ');
};

const legacy = new Set();
for (const section of SECTIONS) {
  const category = categories.find((c) => c.slug === section.slug);
  if (!category) {
    console.log(`"${section.slug}" is gone already`);
    continue;
  }
  const ids = subtree(category.id);
  ids.forEach((id) => legacy.add(id));
  const rows = await call(
    'GET',
    `/items/products_categories?${query({ filter: { category: { _in: ids } }, fields: 'id,product,category', limit: -1 })}`,
  );
  const products = [...new Set(rows.map((r) => r.product))];
  const unflagged = await call(
    'GET',
    `/items/products?${query({ filter: { id: { _in: products }, [section.flag]: { _neq: true } }, fields: 'id', limit: -1 })}`,
  );
  console.log(
    `${category.name}: ${products.length} products, ${unflagged.length} of them get \`${section.flag}\`` +
      (ids.length > 1
        ? `, subcategories: ${ids
            .slice(1)
            .map((id) => byId.get(id).name)
            .join(', ')}`
        : ''),
  );
  if (apply && unflagged.length) {
    for (const keys of chunks(unflagged.map((p) => p.id))) {
      await call('PATCH', '/items/products', { keys, data: { [section.flag]: true } });
    }
  }
  section.rows = rows;
}

// subcategories: their products go to the category of the same name elsewhere
const outside = categories.filter((c) => !legacy.has(c.id));
for (const section of SECTIONS) {
  for (const row of section.rows ?? []) {
    const category = byId.get(row.category);
    if (SECTIONS.some((s) => s.slug === category.slug)) continue; // the section itself
    const twin = outside.find((c) => c.name.trim().toLowerCase() === category.name.trim().toLowerCase());
    section.moves ??= new Map();
    const key = `${category.id}`;
    if (!section.moves.has(key)) section.moves.set(key, { category, twin, products: new Set() });
    section.moves.get(key).products.add(row.product);
  }
  for (const { category, twin, products } of section.moves?.values() ?? []) {
    if (!twin) {
      console.log(`  ${trail(category.id)}: no category of that name elsewhere, its ${products.size} products lose it`);
      continue;
    }
    const there = await call(
      'GET',
      `/items/products_categories?${query({ filter: { category: { _eq: twin.id }, product: { _in: [...products] } }, fields: 'product', limit: -1 })}`,
    );
    const missing = [...products].filter((p) => !there.some((r) => r.product === p));
    console.log(`  ${trail(category.id)} -> ${trail(twin.id)}: ${missing.length} of ${products.size} products added`);
    if (apply && missing.length) {
      await call(
        'POST',
        '/items/products_categories',
        missing.map((product) => ({ product, category: twin.id })),
      );
    }
  }
}

// the categories go, with their product rows
const rowIds = SECTIONS.flatMap((s) => (s.rows ?? []).map((r) => r.id));
console.log(`\ndelete ${rowIds.length} product-category rows and ${legacy.size} categories:`);
for (const id of legacy) console.log(`  ${trail(id)}`);
if (apply) {
  for (const keys of chunks(rowIds)) await call('DELETE', '/items/products_categories', keys);
  // the deepest first, so no category is left pointing at a deleted parent
  const depth = (id) => trail(id).split(' › ').length;
  for (const id of [...legacy].sort((a, b) => depth(b) - depth(a))) await call('DELETE', `/items/categories/${id}`);
}

// the categories left are numbered again without gaps (0, 1, 2... in every group), the way the admin orders them
const left = await call('GET', `/items/categories?${query({ fields: 'id,parent,index,name', limit: -1 })}`);
const groups = new Map();
for (const c of left) groups.set(c.parent ?? null, [...(groups.get(c.parent ?? null) ?? []), c]);
const renumber = [];
for (const group of groups.values()) {
  group.sort((a, b) => a.index - b.index).forEach((c, i) => c.index !== i && renumber.push({ ...c, index: i }));
}
console.log(
  `\n${renumber.length} categories renumbered (e.g. ${
    renumber
      .slice(0, 3)
      .map((c) => `${c.name} -> ${c.index}`)
      .join(', ') || '-'
  })`,
);
if (apply) for (const { id, index } of renumber) await call('PATCH', `/items/categories/${id}`, { index });

// products without a company
const reed = (await call('GET', `/items/companies?${query({ filter: { name: { _eq: 'REED' } }, fields: 'id' })}`))[0];
const orphans = await call(
  'GET',
  `/items/products?${query({ filter: { company: { _null: true } }, fields: 'id', limit: -1 })}`,
);
console.log(`\n${orphans.length} products without a company -> REED (#${reed?.id})`);
if (apply && orphans.length && reed) {
  for (const keys of chunks(orphans.map((p) => p.id)))
    await call('PATCH', '/items/products', { keys, data: { company: reed.id } });
}

// last: products whose saved prices are stale (see recalculate.mjs)
console.log('\nproducts with prices to recalculate:');
if (!apply) console.log('  (dry run: the products flagged above only show up here with --apply)');
await recalculateStale({ call, apply, log: (line) => console.log(`  ${line}`) });

console.log(apply ? '\ndone' : '\nnothing was changed');
