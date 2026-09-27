#!/usr/bin/env node
//
// Moves "multicoloured" from product variants to colours, and marks the transparent colours.
//
//   node scripts/migrate-colors.mjs           # dry run: prints what would change
//   node scripts/migrate-colors.mjs --apply   # makes the changes
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env),
// never the database file, so Directus validates and logs it like an edit in the admin panel.
// Needs the `multicolor` and `transparent` fields on colours first (see the instructions).
//
// - colours named like "przezroczysty", "transparent", "bezbarwny" get `transparent`
// - colours named like "wielokolorowy", "multicolor" get `multicolor`
// - variants with the old `multicolored` flag get the multicolour colour as their first colour
//   (their second colour is cleared, the list shows what they had)
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
const headers = { Authorization: `Bearer ${env.DIRECTUS_TOKEN}`, 'Content-Type': 'application/json' };

async function call(method, url, body) {
  const res = await fetch(`${env.API}${url}`, { method, headers, body: body && JSON.stringify(body) });
  if (!res.ok) throw new Error(`${method} ${url}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : (await res.json()).data;
}

const fields = (await call('GET', '/fields/colors')).map((f) => f.field);
if (!fields.includes('multicolor') || !fields.includes('transparent')) {
  console.error('Colours have no `multicolor` / `transparent` fields yet - add them in the admin panel first.');
  process.exit(1);
}

console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');

const colors = await call('GET', '/items/colors?fields=id,name,color,multicolor,transparent&limit=-1');
const flags = [
  ['transparent', /przezroczyst|transparent|bezbarwn/i],
  ['multicolor', /wielokolor|multi-?colou?r/i],
];
for (const color of colors) {
  const data = Object.fromEntries(flags.filter(([f, re]) => re.test(color.name) && !color[f]).map(([f]) => [f, true]));
  if (!Object.keys(data).length) continue;
  console.log(`colour #${color.id} "${color.name}" -> ${Object.keys(data).join(', ')}`);
  if (apply) await call('PATCH', `/items/colors/${color.id}`, data);
  Object.assign(color, data);
}

const multicolor =
  colors.find((c) => c.multicolor && /^wielokolorowy$/i.test(c.name.trim())) ?? colors.find((c) => c.multicolor);
const variants = await call(
  'GET',
  '/items/products_storage?filter[multicolored][_eq]=true&limit=-1' +
    '&fields=id,api_color_code,color_first.id,color_first.name,color_second.name,product.code,product.name',
).then((list) => list.filter((v) => !v.color_first || v.color_first.id !== multicolor?.id || v.color_second));
if (variants.length && !multicolor) {
  console.error('\nNo multicolour colour to move the variants to - mark one (e.g. "Wielokolorowy") first.');
  process.exit(1);
}
console.log(`\n${variants.length} multicoloured variants -> colour #${multicolor?.id} "${multicolor?.name}":`);
for (const v of variants) {
  const had = [v.color_first?.name, v.color_second?.name].filter(Boolean).join(' / ') || '-';
  console.log(`  ${v.product?.code} ${v.api_color_code ?? ''} (${v.product?.name}), had: ${had}`);
  if (apply) await call('PATCH', `/items/products_storage/${v.id}`, { color_first: multicolor.id, color_second: null });
}

console.log(apply ? '\ndone' : '\nnothing was changed');
