#!/usr/bin/env node
//
// The site's phone from a fragment, and the fragments named for what they are:
// - adds "Numer telefonu" (#13): the phone the rail, the phone bar, the home page, the PDF card and the JSON-LD show,
// - renames "[Stopka] O firmie REED" -> "O firmie", "[Stopka] Copyright" -> "Stopka", "[Stopka] Biuro" -> "Biuro",
// - puts the new phone in Biuro instead of its three,
// - drops the JSON help from "Układ strony głównej" (its description),
// - deletes "Kontakt": /kontakt shows Biuro and O firmie now.
//
//   node scripts/migrate-fragments.mjs           # dry run: prints what would change
//   node scripts/migrate-fragments.mjs --apply   # makes the changes: right before deploy.sh - the site before it doesn't
//                                                # read #13, but its /kontakt fails without Kontakt until the deploy is up
//
// Through the Directus API like migrate-stamps.mjs (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env, `API=...`
// in front to point it elsewhere). Anything already done is left as it is.
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

const PHONE = '+48 731 79 79 72';
const phoneLink = `<a href="tel:${PHONE.replace(/\s/g, '')}">${PHONE}</a>`;

// #13, as frontend/src/lib/website/seo.js's PHONE
const PHONE_FRAGMENT = {
  id: 13,
  name: 'Numer telefonu',
  content: PHONE,
  description:
    'Sam numer, ze spacjami, np. „+48 731 79 79 72”: pokazuje go panel boczny, pasek u dołu telefonu, strona główna, karta PDF i dane dla Google. Biuro (w stopce i w Kontakcie) ma numer wpisany w swojej treści.',
};
const NAMES = [
  { id: 2, from: '[Stopka] O firmie REED', to: 'O firmie' },
  { id: 3, from: '[Stopka] Copyright', to: 'Stopka' },
  { id: 4, from: '[Stopka] Biuro', to: 'Biuro' },
];
const BIURO = 4;
const LAYOUT = 12;
const KONTAKT = { id: 1, name: 'Kontakt' };

// Biuro's "tel. <a href="tel:...">...</a><br>" lines, one after another
const phoneLines = /tel\. <a href="tel:[^"]*">[^<]*<\/a>(?:<br>\s*tel\. <a href="tel:[^"]*">[^<]*<\/a>)*/;

console.log(`${apply ? 'APPLYING' : 'DRY RUN (add --apply to make the changes)'} on ${API}\n`);

const fragments = await call('GET', '/items/fragments?fields=id,name,content,description&limit=-1');
const byId = Object.fromEntries(fragments.map((f) => [f.id, f]));

const phone = byId[PHONE_FRAGMENT.id];
if (phone?.name === PHONE_FRAGMENT.name) {
  console.log(`#${phone.id} „${phone.name}”: already there (${phone.content})`);
} else if (phone) {
  console.log(
    `#${phone.id} is „${phone.name}”, not „${PHONE_FRAGMENT.name}”: the site reads the phone from it - stopping`,
  );
  process.exit(1);
} else {
  console.log(`#${PHONE_FRAGMENT.id} „${PHONE_FRAGMENT.name}”: add (${PHONE})`);
  if (apply) await call('POST', '/items/fragments', PHONE_FRAGMENT);
}

for (const { id, from, to } of NAMES) {
  const name = byId[id]?.name;
  if (name === to) {
    console.log(`#${id} „${to}”: already named so`);
  } else if (name !== from) {
    console.log(`#${id}: is „${name}”, not „${from}” - left as it is`);
  } else {
    console.log(`#${id} „${from}” -> „${to}”`);
    if (apply) await call('PATCH', `/items/fragments/${id}`, { name: to });
  }
}

const biuro = byId[BIURO];
const content = biuro?.content?.replace(phoneLines, `tel. ${phoneLink}`);
if (!biuro?.content || !phoneLines.test(biuro.content)) {
  console.log(`#${BIURO}: no phone lines found - left as it is`);
} else if (content === biuro.content) {
  console.log(`#${BIURO}: already only ${PHONE}`);
} else {
  console.log(
    `#${BIURO}: phones -> ${PHONE}\n${biuro.content
      .match(phoneLines)[0]
      .split('\n')
      .map((line) => `  - ${line.trim()}`)
      .join('\n')}`,
  );
  if (apply) await call('PATCH', `/items/fragments/${BIURO}`, { content });
}

if (!byId[LAYOUT]?.description) {
  console.log(`#${LAYOUT}: no description already`);
} else {
  console.log(
    `#${LAYOUT} „${byId[LAYOUT].name}”: remove the description (${byId[LAYOUT].description.length} characters)`,
  );
  if (apply) await call('PATCH', `/items/fragments/${LAYOUT}`, { description: null });
}

const kontakt = byId[KONTAKT.id];
if (!kontakt) {
  console.log(`#${KONTAKT.id}: already deleted`);
} else if (kontakt.name !== KONTAKT.name) {
  console.log(`#${KONTAKT.id}: is „${kontakt.name}”, not „${KONTAKT.name}” - left as it is`);
} else {
  console.log(`#${KONTAKT.id} „${KONTAKT.name}”: delete`);
  if (apply) await call('DELETE', `/items/fragments/${KONTAKT.id}`);
}

console.log(apply ? '\nDone.' : '\nDry run: nothing changed.');
