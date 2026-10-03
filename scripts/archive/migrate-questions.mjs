#!/usr/bin/env node
//
// Links every question asked on a product's page to its product, instead of its code on top of the message.
//
//   node scripts/archive/migrate-questions.mjs           # dry run: prints what would change
//   node scripts/archive/migrate-questions.mjs --apply   # makes the changes
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env),
// never the database file, so Directus validates and logs it like an edit in the admin panel.
// Needs `questions.product` first (migrate-schema-2.mjs); run it after the deploy (the old website still writes the
// code into the message), then `migrate-schema-2.mjs --cleanup` removes from_contact / from_product / spam_chance / file.
//
// - a question starting with "# Kod: <code>" gets the product with that code (or the product of a variant with it, or -
//   REED's own codes lost their "REED-" since - the product with the rest of it), and the line is taken off the message
// - a code no product has any more (deleted, renamed) stays in the message: it's all there is to go on
// - their "Aktualizacja" stays as it is: the two fields that stamp it are switched off for these updates, and back on
//   right after them (as in migrate-unread.mjs)
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

const fields = (await call('GET', '/fields/questions')).map((f) => f.field);
if (!fields.includes('product')) {
  console.error('Questions have no `product` field yet - run migrate-schema-2.mjs --apply first.');
  process.exit(1);
}

console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');

const PREFIX = /^# Kod: *([^\n]*?) *(\n+|$)/;

const questions = await call('GET', '/items/questions?fields=id,content,product&limit=-1');
const products = await call('GET', '/items/products?fields=id,code&limit=-1');
const variants = await call('GET', '/items/products_storage?fields=product,api_color_code&limit=-1');
// code -> the products with it (a code two products share links neither: it's said which, see below)
const index = (pairs) => {
  const map = new Map();
  for (const [code, id] of pairs) map.set(code, new Set([...(map.get(code) ?? []), id]));
  return map;
};
const byCode = index(products.filter((p) => p.code).map((p) => [p.code.trim().toLowerCase(), p.id]));
const byVariant = index(
  variants.filter((v) => v.api_color_code && v.product).map((v) => [v.api_color_code.trim().toLowerCase(), v.product]),
);

const updates = [];
const unknown = [];
const ambiguous = [];
for (const q of questions) {
  const m = PREFIX.exec(q.content ?? '');
  if (!m || q.product) continue;
  const code = m[1].trim().toLowerCase();
  const found = byCode.get(code) ?? byVariant.get(code) ?? byCode.get(code.replace(/^reed-/, ''));
  if (!found) unknown.push(`#${q.id} "${m[1]}"`);
  else if (found.size > 1) ambiguous.push(`#${q.id} "${m[1]}" (products ${[...found].join(', ')})`);
  else updates.push({ id: q.id, product: [...found][0], content: q.content.slice(m[0].length) });
}

console.log(`${updates.length} questions -> their product, the code line taken off the message`);
console.log(`${unknown.length} with a code no product has (left as they are): ${unknown.join(', ') || '-'}`);
console.log(`${ambiguous.length} with a code several products have (left as they are): ${ambiguous.join(', ') || '-'}`);

if (apply && updates.length) {
  // the stamping is off while the links are written, so the questions keep their dates; put back with its own
  // value even if a run was killed before (a field still without it - left so by that run - gets it back too)
  const stamps = { date_updated: 'date-updated', user_updated: 'user-updated' };
  const specials = {};
  for (const [f, stamp] of Object.entries(stamps)) {
    const special = (await call('GET', `/fields/questions/${f}`)).meta?.special ?? [];
    specials[f] = special.includes(stamp) ? special : [stamp, ...special];
  }
  const restore = async () => {
    for (const f of Object.keys(stamps))
      await call('PATCH', `/fields/questions/${f}`, { meta: { special: specials[f] } });
  };
  process.once('SIGINT', () => restore().finally(() => process.exit(130)));
  try {
    for (const [f, stamp] of Object.entries(stamps)) {
      const special = specials[f].filter((s) => s !== stamp);
      await call('PATCH', `/fields/questions/${f}`, { meta: { special } });
    }
    for (let i = 0; i < updates.length; i += 100) {
      await call('PATCH', '/items/questions', updates.slice(i, i + 100));
    }
  } finally {
    await restore();
  }
}

console.log(apply ? '\ndone' : '\nnothing was changed');
