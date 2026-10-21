#!/usr/bin/env node
//
// A product's "Aktualizacja" becomes its last manual edit, beside "Skan" and "Przeliczenie": products.scanned_at and
// products.recalculated_at, and date_updated / user_updated without their Directus specials - the product-stamps hook
// (backend/directus/extensions/hooks/product-stamps) stamps all four instead.
//
//   node scripts/migrate-stamps.mjs           # dry run: prints what would change
//   node scripts/migrate-stamps.mjs --apply   # makes the changes: right after deploy.sh --full, whose Directus restart
//                                             # loads the hook and HEIMDALL_USER (backend/directus/.env, set first) -
//                                             # without the hook a manual save stamps nothing; it refuses to run then
//
// Through the Directus API like migrate-logs.mjs (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env, `API=...`
// in front to point it elsewhere). Anything already done is left as it is. Admin-only: Public reads neither field.
//
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// as date_updated
const date = (field, note) => ({
  field,
  type: 'timestamp',
  schema: {},
  meta: {
    interface: 'datetime',
    display: 'datetime',
    display_options: { relative: true },
    readonly: true,
    hidden: true,
    width: 'half',
    note,
  },
});
const FIELDS = [
  date('scanned_at', 'Ostatni skan, który zmienił produkt (jego warianty, znakowania, kategorie, zdjęcia)'),
  date('recalculated_at', 'Ostatnie przeliczenie, które zmieniło ceny produktu'),
];
const UNSPECIAL = ['date_updated', 'user_updated'];

console.log(`${apply ? 'APPLYING' : 'DRY RUN (add --apply to make the changes)'} on ${API}\n`);

// (the hooks Directus found when it started)
if (!(await call('GET', '/extensions/hooks')).some((e) => e.name === 'product-stamps')) {
  console.log('Directus runs without the product-stamps hook: restart it first (deploy.sh --full does).');
  if (apply) process.exit(1);
}

const fields = await call('GET', '/fields/products');
for (const field of FIELDS) {
  if (fields.some((f) => f.field === field.field)) {
    console.log(`products.${field.field}: already there`);
  } else {
    console.log(`products.${field.field}: add (timestamp)`);
    if (apply) await call('POST', '/fields/products', field);
  }
}
for (const name of UNSPECIAL) {
  const special = fields.find((f) => f.field === name)?.meta?.special;
  if (!special?.length) {
    console.log(`products.${name}: no special already`);
  } else {
    console.log(`products.${name}: remove special ${special.join(', ')}`);
    if (apply) await call('PATCH', `/fields/products/${name}`, { meta: { special: null } });
  }
}
