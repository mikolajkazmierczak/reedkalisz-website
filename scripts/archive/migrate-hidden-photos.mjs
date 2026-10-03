#!/usr/bin/env node
//
// Takes the hidden photos off their products: the admin can't hide a photo any more (one that shouldn't show is
// deleted), so the ones hidden before go.
//
//   node scripts/archive/migrate-hidden-photos.mjs           # dry run: prints what would change
//   node scripts/archive/migrate-hidden-photos.mjs --apply   # makes the changes
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env),
// never the database file, so Directus validates and logs it like an edit in the admin panel.
//
// - a variant's hidden photo (products_storage_image, enabled = false) and a hidden gallery photo (products_image)
//   lose their row; the file stays in the library, in its product's file history ("Używany w" shows it), and the
//   library's Posprzątaj deletes it when nothing uses it
//
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const apply = process.argv.includes('--apply');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
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

console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');

const hidden = '?filter[enabled][_eq]=false&limit=-1';
const variants = await call(
  'GET',
  `/items/products_storage_image${hidden}&fields=id,img,products_storage.api_color_code,products_storage.product.id,products_storage.product.code,products_storage.product.name`,
);
const gallery = await call('GET', `/items/products_image${hidden}&fields=id,img,product.id,product.code,product.name`);

const rows = [
  ...variants.map((r) => ({
    collection: 'products_storage_image',
    id: r.id,
    img: r.img,
    product: r.products_storage?.product,
    where: `wariant ${r.products_storage?.api_color_code ?? ''}`,
  })),
  ...gallery.map((r) => ({ collection: 'products_image', id: r.id, img: r.img, product: r.product, where: 'galeria' })),
];
console.log(`${rows.length} hidden photos:`);
for (const r of rows) console.log(`  ${r.product?.code} ${r.product?.name} - ${r.where}`);

if (apply && rows.length) {
  // their files into their products' history first, so the library still says where they were used
  const byProduct = new Map();
  for (const r of rows)
    if (r.product?.id && r.img) byProduct.set(r.product.id, [...(byProduct.get(r.product.id) ?? []), r.img]);
  for (const [id, files] of byProduct) {
    const { images_history: history } = await call('GET', `/items/products/${id}?fields=images_history`);
    const missing = files.filter((f) => !(history ?? []).includes(f)); // (usually there already: saved with them)
    if (missing.length)
      await call('PATCH', `/items/products/${id}`, { images_history: [...(history ?? []), ...missing] });
  }
  for (const collection of ['products_storage_image', 'products_image']) {
    const ids = rows.filter((r) => r.collection === collection).map((r) => r.id);
    if (ids.length) await call('DELETE', `/items/${collection}`, ids);
  }
}

console.log(apply ? '\ndone' : '\nnothing was changed');
