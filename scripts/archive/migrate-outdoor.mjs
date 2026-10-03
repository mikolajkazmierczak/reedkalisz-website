#!/usr/bin/env node
//
// New pictures for "Reklama zewnętrzna" (drawn like the website's category icons, scripts/assets/reklama-zewnetrzna/),
// and a Roll-up product there.
//
//   node scripts/archive/migrate-outdoor.mjs           # dry run: prints what would change
//   node scripts/archive/migrate-outdoor.mjs --apply   # makes the changes
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env),
// never the database file, so Directus validates and logs it like an edit in the admin panel.
//
// - the drawings go to the library (REED's, titled "<code> / ilustracja"), once: a second run finds them by title
// - BJ, BJT, BD and T get theirs as their only gallery image; the admins' old ones leave the gallery but stay in the
//   library, in the product's file history (the library's "Używany w" still shows them)
// - Roll-up ("RU") is added hidden, as REED's, in the category, with its drawing and the paragraph and price view the
//   others have: its description and prices are the admins' to fill in before showing it
//
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { slugify } from '../../shared/utils.js';

const apply = process.argv.includes('--apply');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, 'backend/heimdall/.env'), 'utf8')
    .split('\n')
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1).trim()]),
);
const auth = { Authorization: `Bearer ${env.DIRECTUS_TOKEN}` };

async function call(method, url, body) {
  const res = await fetch(`${env.API}${url}`, {
    method,
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${url}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : (await res.json()).data;
}

const DIR = path.join(root, 'scripts/archive/assets/reklama-zewnetrzna');
const CATEGORY = 'Reklama zewnętrzna';
const DRAWINGS = { BJ: 'BJ.svg', BJT: 'BJT.svg', BD: 'BD.svg', T: 'T.svg', RU: 'ROLLUP.svg' };
const ROLLUP = { code: 'RU', name: 'Roll-up' };

console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');

const [category] = await call('GET', `/items/categories?filter[name][_eq]=${encodeURIComponent(CATEGORY)}&fields=id`);
const [reed] = await call('GET', '/items/companies?filter[name][_eq]=REED&fields=id');
if (!category || !reed) {
  console.error(`No category "${CATEGORY}" or no company REED.`);
  process.exit(1);
}
const fields = 'id,code,name,slug,company,commercial_details,price_view,images_history,gallery.id,gallery.img';
const products = await call(
  'GET',
  `/items/products?filter[company][_eq]=${reed.id}&filter[code][_in]=${Object.keys(DRAWINGS).join(',')}&fields=${fields}&limit=-1`,
);

// the drawing of a code in the library: found by its title, or uploaded
async function drawing(code) {
  const title = `${code} / ilustracja`;
  const [found] = await call('GET', `/files?filter[title][_eq]=${encodeURIComponent(title)}&fields=id`);
  if (found) return found.id;
  console.log(`  upload ${DRAWINGS[code]} as "${title}"`);
  if (!apply) return `<${code}>`;
  const form = new FormData();
  form.append('title', title);
  form.append('company', String(reed.id));
  const file = fs.readFileSync(path.join(DIR, DRAWINGS[code]));
  form.append('file', new Blob([file], { type: 'image/svg+xml' }), `${code.toLowerCase()}-ilustracja.svg`);
  const res = await fetch(`${env.API}/files`, { method: 'POST', headers: auth, body: form });
  if (!res.ok) throw new Error(`POST /files: ${res.status} ${await res.text()}`);
  return (await res.json()).data.id;
}

for (const code of ['BJ', 'BJT', 'BD', 'T']) {
  const product = products.find((p) => p.code === code);
  if (!product) {
    console.log(`${code}: no such product, skipped`);
    continue;
  }
  const img = await drawing(code);
  const gallery = product.gallery ?? [];
  if (gallery.length === 1 && gallery[0].img === img) {
    console.log(`${code} "${product.name}": has its drawing already`);
    continue;
  }
  const old = gallery.map((g) => g.img).filter((id) => id && id !== img);
  console.log(`${code} "${product.name}": drawing as its gallery (${old.length} old images out of the gallery)`);
  if (apply) {
    await call('PATCH', `/items/products/${product.id}`, {
      gallery: { create: [{ img, index: 0, main: true, enabled: true }], update: [], delete: gallery.map((g) => g.id) },
      images_history: [...new Set([...(product.images_history ?? []), ...old, img])],
    });
  }
}

if (products.some((p) => p.code === ROLLUP.code)) {
  console.log(`${ROLLUP.code}: there already`);
} else {
  const model = products.find((p) => p.code === 'BJ');
  const img = await drawing('RU');
  const slug = slugify([ROLLUP.code, ROLLUP.name], { key: true });
  console.log(`${ROLLUP.code} "${ROLLUP.name}": add, hidden, in "${CATEGORY}" (/produkty/${slug})`);
  if (apply) {
    await call('POST', '/items/products', {
      ...ROLLUP,
      slug,
      enabled: false,
      company: reed.id,
      commercial_details: model?.commercial_details ?? null,
      price_view: model?.price_view ?? null,
      categories: [{ category: category.id, index: 0 }],
      gallery: [{ img, index: 0, main: true, enabled: true }],
      images_history: [img],
    });
  }
}

console.log(apply ? '\ndone' : '\nnothing was changed');
