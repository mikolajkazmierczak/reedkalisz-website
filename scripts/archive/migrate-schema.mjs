#!/usr/bin/env node
//
// The fields, the relation and the Public permission the new admin and website need, then (after the deploy and the
// other migrations) the old fields removed.
//
//   node scripts/archive/migrate-schema.mjs                     # dry run: prints what would change
//   node scripts/archive/migrate-schema.mjs --apply             # makes the changes: BEFORE the deploy
//   node scripts/archive/migrate-schema.mjs --cleanup           # dry run of the removals
//   node scripts/archive/migrate-schema.mjs --cleanup --apply   # removes them: AFTER the deploy and the other migrations
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env): the same
// requests the admin panel sends from Settings > Data Model, so Directus writes its own `directus_fields` /
// `directus_relations` rows. The definitions are copies of the ones made locally. A field or relation that is already
// there is left as it is, so running it again changes nothing.
//
// - questions' `read` is added with the default "true" (every question there is now becomes read, without editing
//   them), then its default is switched to "false", so the ones sent from now on start unread (see migrate-unread.mjs)
// - Public may read the two new colour flags (a field it can't read would fail the whole colours query of the site)
// - cleanup: Public reads every colour, not only the enabled ones (all of them are, the new site doesn't ask), then
//   `colors.enabled` and `products.api_enabled` are deleted - in that order, or public colour reads break
//
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const apply = process.argv.includes('--apply');
const cleanup = process.argv.includes('--cleanup');
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

const json = (collection, field) => ({
  collection,
  field: { field, type: 'json', meta: { special: ['cast-json'], interface: 'input-code', width: 'full' } },
});
const flag = (collection, field, defaultValue, meta = {}) => ({
  collection,
  field: {
    field,
    type: 'boolean',
    schema: { default_value: defaultValue },
    meta: { special: ['cast-boolean'], interface: 'boolean', width: 'half', ...meta },
  },
});

const FIELDS = [
  json('products', 'api_images'),
  {
    collection: 'products',
    field: { field: 'images_history', type: 'csv', meta: { special: ['cast-csv'], interface: 'tags', width: 'full' } },
  },
  json('companies', 'api_categories_mappings'),
  json('companies', 'api_places_mappings'),
  json('companies', 'api_labelings_codes'),
  flag('colors', 'multicolor', false),
  flag('colors', 'transparent', false),
  flag('questions', 'read', true, { width: 'full', note: 'Otwarte w panelu (nowe zapytania są nieprzeczytane)' }),
  {
    collection: 'directus_files',
    field: {
      field: 'company',
      type: 'integer',
      schema: {},
      meta: {
        special: ['m2o'],
        interface: 'select-dropdown-m2o',
        options: { template: '{{name}}' },
        display: 'related-values',
        width: 'full',
      },
    },
    relation: {
      collection: 'directus_files',
      field: 'company',
      related_collection: 'companies',
      schema: { on_delete: 'SET NULL' },
      meta: { one_deselect_action: 'nullify' },
    },
  },
];
const PUBLIC_COLORS = ['multicolor', 'transparent'];

console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');

const has = async (collection, field) => (await call('GET', `/fields/${collection}`)).some((f) => f.field === field);
const publicColors = async () =>
  (
    await call('GET', '/permissions?filter[role][_null]=true&filter[collection][_eq]=colors&filter[action][_eq]=read')
  )[0];

if (!cleanup) {
  for (const { collection, field, relation } of FIELDS) {
    const name = `${collection}.${field.field}`;
    if (await has(collection, field.field)) {
      console.log(`${name}: already there`);
    } else {
      console.log(
        `${name}: add (${field.type}${field.schema?.default_value != null ? `, default ${field.schema.default_value}` : ''})`,
      );
      if (apply) await call('POST', `/fields/${collection}`, field);
    }
    if (!relation) continue;
    const relations = await call('GET', `/relations/${relation.collection}`);
    if (relations.some((r) => r.field === relation.field)) {
      console.log(`${name}: its relation to ${relation.related_collection} is already there`);
    } else {
      console.log(`${name}: relate to ${relation.related_collection} (on delete SET NULL)`);
      if (apply) await call('POST', '/relations', relation);
    }
  }

  // every question there is now is read (the default filled them in); the new ones start unread. 0, not false: changing
  // a default makes SQLite rebuild the table, and `false` goes in as the text 'false' - new questions would then read
  // "false" (true in JS) and no filter for unread would find them. The API shows both as false, so it's always set.
  console.log('questions.read: default -> 0 (the questions there are now stay read)');
  if (apply) await call('PATCH', '/fields/questions/read', { type: 'boolean', schema: { default_value: 0 } });

  const permission = await publicColors();
  const missing = PUBLIC_COLORS.filter((f) => !permission.fields.includes(f));
  if (missing.length) {
    console.log(`Public, colours read (#${permission.id}): + ${missing.join(', ')}`);
    if (apply) await call('PATCH', `/permissions/${permission.id}`, { fields: [...permission.fields, ...missing] });
  } else {
    console.log('Public, colours read: already reads the flags');
  }
} else {
  const permission = await publicColors();
  const fields = permission.fields.filter((f) => f !== 'enabled');
  if (fields.length !== permission.fields.length || permission.permissions?._and?.length) {
    console.log(`Public, colours read (#${permission.id}): every colour (no "enabled" filter), without the field`);
    if (apply) await call('PATCH', `/permissions/${permission.id}`, { fields, permissions: {} });
  } else {
    console.log('Public, colours read: already without "enabled"');
  }
  for (const [collection, field] of [
    ['colors', 'enabled'],
    ['products', 'api_enabled'],
  ]) {
    if (await has(collection, field)) {
      console.log(`${collection}.${field}: delete`);
      if (apply) await call('DELETE', `/fields/${collection}/${field}`);
    } else {
      console.log(`${collection}.${field}: already gone`);
    }
  }
}

console.log(apply ? '\ndone' : '\nnothing was changed');
