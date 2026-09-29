#!/usr/bin/env node
//
// Category names in sentence case, and phone numbers with +48.
//
//   node scripts/migrate-names.mjs           # dry run: prints what would change
//   node scripts/migrate-names.mjs --apply   # makes the changes
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env),
// never the database file, so Directus validates and logs it like an edit in the admin panel.
// "Aktualizacja" stays as it is: the fields that stamp it are switched off for the updates, and back on after them.
//
// - category names: all-capitals ones go to sentence case, keeping words with a digit ("NOTESY A4" -> "Notesy A4");
//   in the others only the EMPHASIS words go small ("Druki dla KOMINIARZY" -> "Druki dla kominiarzy"), the other
//   capitals are names of lines and codes ("MAGIC LASER", "Druki WZ") and stay; the first letter always goes big
// - the phone links in the fragments (the footer's, Kontakt's) get +48:
//   <a href="tel:62 753 15 91">62 753 15 91</a> -> <a href="tel:+48627531591">+48 62 753 15 91</a>
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

// the words written in capitals for emphasis in names that aren't all capitals
const EMPHASIS = new Set(['KOMINIARZY', 'TRANSPORTOWYCH', 'ZAMÓWIENIE', 'FIRM']);

const letters = (s) => s.replace(/[^\p{L}]/gu, '');
const allCaps = (s) => letters(s).length > 0 && letters(s) === letters(s).toLocaleUpperCase('pl');
const capitalise = (s) => s.charAt(0).toLocaleUpperCase('pl') + s.slice(1);

function sentenceCase(name) {
  const clean = name.replace(/\s+/g, ' ').trim();
  let words = clean.split(' ');
  if (allCaps(clean)) {
    words = words.map((w) => (/\d/.test(w) ? w : w.toLocaleLowerCase('pl')));
  } else {
    words = words.map((w) => (EMPHASIS.has(w) ? w.toLocaleLowerCase('pl') : w));
  }
  words[0] = capitalise(words[0]);
  return words.join(' ');
}

// the prefixes of Polish mobile numbers (written 608 612 625; the rest are landlines: 62 753 15 91)
const MOBILE = /^(5[0137]|6[069]|7[2389]|88)/;

// "62 753 15 91" (with or without +48 already) -> { href: '+48627531591', text: '+48 62 753 15 91' }
function withPrefix(number) {
  const digits = number.replace(/\D/g, '').replace(/^48(?=\d{9}$)/, '');
  if (digits.length !== 9) return null;
  const text = MOBILE.test(digits)
    ? digits.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
    : digits.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  return { href: `+48${digits}`, text: `+48 ${text}` };
}
const phoneLink = /<a href="tel:([^"]+)">([^<]+)<\/a>/g;
function prefixPhones(html) {
  return html.replace(phoneLink, (whole, href) => {
    const p = withPrefix(href);
    return p ? `<a href="tel:${p.href}">${p.text}</a>` : whole;
  });
}

// runs `update` with the collection's "Aktualizacja" stamps switched off
async function unstamped(collection, update) {
  const stamps = ['date_updated', 'user_updated'];
  const specials = {};
  for (const f of stamps) specials[f] = (await call('GET', `/fields/${collection}/${f}`)).meta?.special ?? null;
  try {
    for (const f of stamps) {
      const special = (specials[f] ?? []).filter((s) => !['date-updated', 'user-updated'].includes(s));
      await call('PATCH', `/fields/${collection}/${f}`, { meta: { special } });
    }
    await update();
  } finally {
    for (const f of stamps) await call('PATCH', `/fields/${collection}/${f}`, { meta: { special: specials[f] } });
  }
}

console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');

const categories = await call('GET', '/items/categories?fields=id,name&limit=-1');
const renames = categories.map((c) => ({ ...c, next: sentenceCase(c.name) })).filter((c) => c.next !== c.name);
console.log(`${renames.length} of ${categories.length} category names change:`);
for (const c of renames) console.log(`  #${c.id} "${c.name}" -> "${c.next}"`);
const kept = [
  ...new Set(
    categories
      .filter((c) => !allCaps(c.name))
      .flatMap((c) => c.name.split(/\s+/))
      .filter((w) => letters(w).length > 1 && allCaps(w) && !EMPHASIS.has(w)),
  ),
].sort();
console.log(`  (kept in capitals, as names of lines and codes: ${kept.join(', ')})`);
if (apply && renames.length) {
  await unstamped('categories', async () => {
    for (const c of renames) await call('PATCH', `/items/categories/${c.id}`, { name: c.next });
  });
}

const fragments = await call('GET', '/items/fragments?fields=id,name,content&limit=-1');
const phoned = fragments
  .map((f) => ({ ...f, next: prefixPhones(f.content ?? '') }))
  .filter((f) => f.next !== (f.content ?? ''));
console.log(`\n${phoned.length} fragments with phone numbers without +48:`);
for (const f of phoned) {
  const before = [...(f.content ?? '').matchAll(phoneLink)].map((m) => m[2]);
  const after = [...f.next.matchAll(phoneLink)].map((m) => m[2]);
  console.log(`  #${f.id} "${f.name}": ${before.join(', ')} -> ${after.join(', ')}`);
}
if (apply && phoned.length) {
  await unstamped('fragments', async () => {
    for (const f of phoned) await call('PATCH', `/items/fragments/${f.id}`, { content: f.next });
  });
}

console.log(apply ? '\ndone' : '\nnothing was changed');
