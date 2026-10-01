#!/usr/bin/env node
//
// Starts the "something to look at" markers in the menu from a clean slate.
// ONE-OFF, applied on prod 2026-09-28: it reads questions' from_product / from_contact, which
// migrate-schema-2.mjs --cleanup removes - after that it can't run (and needn't).
//
//   node scripts/migrate-unread.mjs           # dry run: prints what would change
//   node scripts/migrate-unread.mjs --apply   # makes the changes
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env),
// never the database file, so Directus validates and logs it like an edit in the admin panel.
// Needs the `read` field on questions first (see the instructions). Adding it with the default "true" makes every
// question there is now read, without touching them (an edit would put today's date and the script's user in their
// "Aktualizacja"); then its default is switched to "false", so the ones sent from now on start unread. This only
// checks that it was done:
//
// - no question is unread yet, and the default for new ones is "false"
// - the questions sent before the Kontakt page had its form all came from a product's page, but nothing marked them:
//   they get "from product" (not the ones written in the panel, which have their author). Their "Aktualizacja" stays
//   as it is: the two fields that stamp it are switched off for this update, and back on right after it
// - a colour whose white only stood in for "no colour" (Mix, Neutralny...) loses it: its colour is empty, so the menu
//   asks for one. A real white keeps it (biały, white, biel), and so does a see-through one named white. Multicolour
//   and see-through colours don't need one (their swatch doesn't use it), so they aren't asked for it.
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

const fields = (await call('GET', '/fields/questions')).map((f) => f.field);
if (!fields.includes('read')) {
  console.error('Questions have no `read` field yet - add it in the admin panel first.');
  process.exit(1);
}

console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');

const unread = await call('GET', '/items/questions?fields=id&filter[read][_neq]=true&limit=-1');
const readField = await call('GET', '/fields/questions/read');
const readDefault = readField.schema?.default_value;
console.log(`${unread.length} questions unread (should be 0: the field was added with the default "true")`);
console.log(`new questions start as read = ${readDefault} (should be false)`);

const unmarked = await call(
  'GET',
  '/items/questions?fields=id&filter[from_product][_neq]=true&filter[from_contact][_neq]=true' +
    '&filter[user_created][_null]=true&limit=-1',
);
console.log(`\n${unmarked.length} questions from the website with no source -> "from product"`);
if (apply && unmarked.length) {
  const stamps = ['date_updated', 'user_updated'];
  const specials = {};
  for (const f of stamps) specials[f] = (await call('GET', `/fields/questions/${f}`)).meta?.special ?? null;
  try {
    for (const f of stamps) {
      const special = (specials[f] ?? []).filter((s) => !['date-updated', 'user-updated'].includes(s));
      await call('PATCH', `/fields/questions/${f}`, { meta: { special } });
    }
    const ids = unmarked.map((q) => q.id);
    for (let i = 0; i < ids.length; i += 100) {
      await call('PATCH', '/items/questions', { keys: ids.slice(i, i + 100), data: { from_product: true } });
    }
  } finally {
    for (const f of stamps) await call('PATCH', `/fields/questions/${f}`, { meta: { special: specials[f] } });
  }
}

const colors = await call('GET', '/items/colors?fields=id,name,color,multicolor,transparent&limit=-1');
const standIns = colors.filter((c) => /^#?f{3}(f{3})?$/i.test(c.color ?? '') && !/bia[łl]|white|biel/i.test(c.name));
console.log(`\n${standIns.length} colours whose white stood in for no colour -> empty:`);
for (const c of standIns) {
  const note = c.multicolor ? ' (multicolour, needs none)' : c.transparent ? ' (see-through, needs none)' : '';
  console.log(`  #${c.id} "${c.name}"${note}`);
  if (apply) await call('PATCH', `/items/colors/${c.id}`, { color: null });
}

console.log(apply ? '\ndone' : '\nnothing was changed');
