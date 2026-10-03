#!/usr/bin/env node
//
// Library files get their company, and the images the api importers brought in get one kind of name:
// '<product code> / <variant code> / #<n>' - the n-th image of that variant (see frontend/src/routes/admin/api/images.js).
// Needs the `company` field on files first (see the instructions).
//
//   node scripts/archive/migrate-file-names.mjs           # dry run: prints what would change
//   node scripts/archive/migrate-file-names.mjs --apply   # makes the changes
//
// - a variant image of a supplier's product: that product's company, and named after where it is now (a file in
//   several variants after the first of them)
// - any other image of a product (a REED product's, a gallery's): its product's company, its name stays - those were
//   named by hand
// - a company's last scan (its snapshot): that company
// - an image no product has: its company and name read from its importer name - 'MidOcean/MO6934/85 0' (an old
//   variant code, completed the way scripts/archive/migrate-variant-codes.mjs does) or 'PAR R73341.02 0'
// - everything else (catalogues, price lists, hand uploads) stays as it is, without a company
//
// A file that already has what it should is left alone, so running it again changes nothing. Renaming a file puts
// Heimdall and the date in its "Aktualizacja", like any edit.
//
// Everything goes through the Directus API (API + DIRECTUS_TOKEN from backend/heimdall/.env).
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

const fields = (await call('GET', '/fields/directus_files')).map((f) => f.field);
if (!fields.includes('company')) {
  console.error('Files have no `company` field yet - add it in the admin panel first.');
  process.exit(1);
}

console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');

const REED = 4;
const title = (code, variant, index) => `${code} / ${variant} / #${index + 1}`; // as the importers name them

// a whole variant code from the product's and an old one, as each supplier writes them (migrate-variant-codes.mjs)
function compose(name, code, old) {
  if (!old || old === '???') return code; // a product with one variant: the product's code is the variant's
  if (old.startsWith(code)) return old; // whole already
  if (name === 'PAR') return `${code}.${old}`;
  if (name === 'MidOcean' || name === 'BlueCollection') return `${code}-${old}`;
  if (name === 'USBSystem') return old;
  if (name === 'AXPOL' && code.includes('.') && old.startsWith('.')) return `${code}${old.slice(1)}`;
  return `${code}${old}`; // AXPOL ('-03', '/A-03' carry their separator), EasyGifts, Macma, Promotionway
}

const companies = await call('GET', '/items/companies?fields=id,name,api_snapshot&limit=-1');
const byName = new Map(companies.map((c) => [c.name, c]));
const products = await call(
  'GET',
  '/items/products?fields=id,code,company,storage.index,storage.api_color_code,storage.img.img,storage.img.index,' +
    'gallery.img&sort=id&limit=-1',
);
const files = await call('GET', '/files?fields=id,title,company&limit=-1');
console.log(`${files.length} files, ${products.length} products\n`);

const want = new Map(); // file id -> { company, title? , why }
const set = (id, change) => !want.has(id) && want.set(id, change);

// the variant images of the suppliers' products first: a file one of those has is named after it
for (const p of products) {
  if (p.company === REED || !p.company) continue;
  for (const s of [...(p.storage ?? [])].sort((a, b) => a.index - b.index)) {
    const imgs = [...(s.img ?? [])].filter((i) => i.img).sort((a, b) => a.index - b.index);
    imgs.forEach((img, i) =>
      set(img.img, { company: p.company, title: title(p.code, s.api_color_code || p.code, i), why: 'variant' }),
    );
  }
}
// then any other image of a product: its company only
for (const p of products) {
  if (!p.company) continue;
  const why = p.company === REED ? 'REED' : 'gallery';
  const imgs = [...(p.storage ?? []).flatMap((s) => s.img ?? []), ...(p.gallery ?? [])];
  for (const img of imgs) if (img.img) set(img.img, { company: p.company, why });
}
// the companies' last scans
for (const c of companies) if (c.api_snapshot) set(c.api_snapshot, { company: c.id, why: 'snapshot' });
// then the ones no product has, by their importer name
for (const f of files) {
  if (want.has(f.id) || !f.title) continue;
  // 'MidOcean/MO6934/85 0', 'AXPOL/V2045//A-03 0' -> [company, code, old variant code, index]; 'PAR R73341.02 0'
  let m = f.title.match(/^([A-Za-z]+)\/([^/]+)\/(.*) (\d+)$/)?.slice(1);
  if (!m || !byName.has(m[0]) || m[1] === '???') m = f.title.match(/^PAR ([A-Z]\d[^ .]*)\.?([^ ]*) (\d+)$/)?.slice(1);
  if (m?.length === 3) m = ['PAR', ...m];
  if (!m) continue;
  const [name, code, old, index] = m;
  const renamed = title(code, compose(name, code, old), Number(index));
  set(f.id, { company: byName.get(name).id, title: renamed, why: 'unused' });
}

const changes = files
  .filter((f) => want.has(f.id))
  .map((f) => ({ file: f, ...want.get(f.id) }))
  .filter(({ file, company, title }) => file.company !== company || (title && file.title !== title));

const names = new Map(companies.map((c) => [c.id, c.name]));
for (const why of ['variant', 'gallery', 'REED', 'snapshot', 'unused']) {
  const these = changes.filter((c) => c.why === why);
  const renamed = these.filter((c) => c.title && c.file.title !== c.title);
  console.log(`${why.padEnd(8)} ${these.length} files, ${renamed.length} renamed`);
  const count = {};
  for (const c of these) count[names.get(c.company)] = (count[names.get(c.company)] ?? 0) + 1;
  console.log(
    `         ${Object.entries(count)
      .map(([n, k]) => `${n} ${k}`)
      .join(', ')}`,
  );
  for (const c of renamed.slice(0, 4)) console.log(`         '${c.file.title}' -> '${c.title}'`);
}
console.log(`\n${files.length - changes.length} files unchanged`);

if (apply && changes.length) {
  const batch = changes.map(({ file, company, title }) => ({ id: file.id, company, ...(title && { title }) }));
  for (let i = 0; i < batch.length; i += 200) {
    await call('PATCH', '/files', batch.slice(i, i + 200));
    process.stdout.write(`\r${Math.min(i + 200, batch.length)}/${batch.length}`);
  }
  console.log('\ndone');
}
