#!/usr/bin/env node
//
// The second round of schema changes (after the admin revamp's migrate-schema.mjs): questions linked to their
// product, product attachments, two more special colours and a "mini" thumbnail. Then (after the deploy and
// migrate-questions.mjs) the old question fields removed.
//
//   node scripts/archive/migrate-schema-2.mjs                     # dry run: prints what would change
//   node scripts/archive/migrate-schema-2.mjs --apply             # makes the changes: BEFORE the deploy
//   node scripts/archive/migrate-schema-2.mjs --cleanup           # dry run of the removals
//   node scripts/archive/migrate-schema-2.mjs --cleanup --apply   # removes them: AFTER the deploy and migrate-questions.mjs
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env): the same
// requests the admin panel sends from Settings > Data Model, so Directus writes its own `directus_fields` /
// `directus_relations` rows. The definitions are copies of the ones made locally. Anything already there is left as
// it is, so running it again changes nothing.
//
// - questions.product: the product a question was asked about (M2O, SET NULL). A question without one came from the
//   Kontakt page (or was written in the panel), so from_contact / from_product go, and so do the spam chance and the
//   file nobody ever filled (cleanup)
// - products_attachment: files attached to a product ("Załączniki", before the gallery), downloaded from its page;
//   like products_image: file, product (O2M `products.attachments`, sorted by index), index, enabled
// - colors.wood / colors.neutral: "Drewno" and "Neutralny", painted like the multicolour (see lib/shared/colors.js)
// - Public: creates questions with a product (and without the old fields after the cleanup), reads the attachments,
//   the new colour flags and a file's size (shown beside an attachment's link)
// - the "mini" preset (64 x 64, cover): a product's thumbnail in the admin's lists
// - the API scans' snapshots (a json per supplier) tagged "hidden", as the avatars: out of the library
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

// (a boolean's default as 0 / 1: `false` would go into SQLite as the text 'false', see migrate-schema.mjs)
const flag = (collection, field) => ({
  collection,
  field: {
    field,
    type: 'boolean',
    schema: { default_value: 0 },
    meta: { special: ['cast-boolean'], interface: 'boolean', width: 'half' },
  },
});

const ATTACHMENTS = {
  collection: 'products_attachment',
  meta: { icon: 'attach_file', group: 'Products', sort: 6, accountability: 'all' },
  schema: {},
  fields: [
    {
      field: 'id',
      type: 'integer',
      schema: { is_primary_key: true, has_auto_increment: true },
      meta: { interface: 'input', readonly: true, hidden: true, width: 'full' },
    },
    { field: 'index', type: 'integer', schema: {}, meta: { hidden: false, width: 'full' } },
    {
      field: 'enabled',
      type: 'boolean',
      schema: { default_value: 1 },
      meta: { special: ['cast-boolean'], interface: 'boolean', width: 'half' },
    },
    { field: 'file', type: 'uuid', schema: {}, meta: { special: ['file'], interface: 'file', width: 'full' } },
    { field: 'product', type: 'integer', schema: {}, meta: { interface: 'select-dropdown-m2o', width: 'full' } },
  ],
};

const FIELDS = [
  {
    collection: 'questions',
    field: {
      field: 'product',
      type: 'integer',
      schema: {},
      meta: {
        interface: 'select-dropdown-m2o',
        options: { template: '{{code}} {{name}}' },
        display: 'related-values',
        width: 'full',
        note: 'Produkt, o który pytano (bez niego: z Kontaktu albo wpisane w panelu)',
      },
    },
    relation: {
      collection: 'questions',
      field: 'product',
      related_collection: 'products',
      schema: { on_delete: 'SET NULL' },
      meta: { one_deselect_action: 'nullify' },
    },
  },
  flag('colors', 'wood'),
  flag('colors', 'neutral'),
  {
    collection: 'products',
    field: { field: 'attachments', type: 'alias', meta: { special: ['o2m'], interface: 'list-o2m', width: 'full' } },
  },
];
const RELATIONS = [
  {
    collection: 'products_attachment',
    field: 'file',
    related_collection: 'directus_files',
    schema: { on_delete: 'CASCADE' },
    meta: { one_deselect_action: 'nullify' },
  },
  {
    collection: 'products_attachment',
    field: 'product',
    related_collection: 'products',
    schema: { on_delete: 'CASCADE' },
    meta: { one_field: 'attachments', sort_field: 'index', one_deselect_action: 'delete' },
  },
];

const OLD_QUESTION_FIELDS = ['from_contact', 'from_product', 'spam_chance', 'file'];
// what Public may do: [collection, action, fields to add, fields to remove (cleanup only), a new permission's filter]
const PUBLIC = [
  ['questions', 'create', ['product'], OLD_QUESTION_FIELDS],
  ['products', 'read', ['attachments'], []],
  ['products_attachment', 'read', ['id', 'file', 'product', 'index', 'enabled'], [], { enabled: { _eq: true } }],
  ['colors', 'read', ['wood', 'neutral'], []],
  ['directus_files', 'read', ['filesize'], []],
];

const MINI = {
  key: 'mini',
  fit: 'cover',
  width: 64,
  height: 64,
  quality: 80,
  withoutEnlargement: false,
  format: 'webp',
  transforms: [],
};

console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');

const has = async (collection, field) => (await call('GET', `/fields/${collection}`)).some((f) => f.field === field);
const collectionExists = async (collection) =>
  (await call('GET', '/collections')).some((c) => c.collection === collection);
const publicPermission = async (collection, action) =>
  (
    await call(
      'GET',
      `/permissions?filter[role][_null]=true&filter[collection][_eq]=${collection}&filter[action][_eq]=${action}`,
    )
  )[0];

async function relate(relation) {
  const name = `${relation.collection}.${relation.field}`;
  // (a collection not made yet, in a dry run: none)
  const relations = (await collectionExists(relation.collection))
    ? await call('GET', `/relations/${relation.collection}`)
    : [];
  if (relations.some((r) => r.field === relation.field)) {
    console.log(`${name}: its relation to ${relation.related_collection} is already there`);
  } else {
    console.log(`${name}: relate to ${relation.related_collection} (on delete ${relation.schema.on_delete})`);
    if (apply) await call('POST', '/relations', relation);
  }
}

if (!cleanup) {
  if (await collectionExists(ATTACHMENTS.collection)) {
    console.log(`${ATTACHMENTS.collection}: already there`);
  } else {
    console.log(`${ATTACHMENTS.collection}: create (${ATTACHMENTS.fields.map((f) => f.field).join(', ')})`);
    if (apply) await call('POST', '/collections', ATTACHMENTS);
  }

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
    if (relation) await relate(relation);
  }
  for (const relation of RELATIONS) await relate(relation);

  for (const [collection, action, add, , permissions] of PUBLIC) {
    const permission = await publicPermission(collection, action);
    if (!permission) {
      console.log(`Public, ${collection} ${action}: create (${add.join(', ')})`);
      if (apply) await call('POST', '/permissions', { role: null, collection, action, fields: add, permissions });
      continue;
    }
    const fields = permission.fields ?? [];
    const missing = add.filter((f) => !fields.includes(f));
    if (missing.length) {
      console.log(`Public, ${collection} ${action} (#${permission.id}): + ${missing.join(', ')}`);
      if (apply) await call('PATCH', `/permissions/${permission.id}`, { fields: [...fields, ...missing] });
    } else {
      console.log(`Public, ${collection} ${action}: already has ${add.join(', ')}`);
    }
  }

  const snapshots = (await call('GET', '/items/companies?fields=name,api_snapshot&limit=-1')).filter(
    (c) => c.api_snapshot,
  );
  for (const { name, api_snapshot: id } of snapshots) {
    const { tags } = await call('GET', `/files/${id}?fields=tags`);
    if (tags?.includes('hidden')) continue;
    console.log(`snapshot of ${name}: tag "hidden"`);
    if (apply) await call('PATCH', `/files/${id}`, { tags: [...(tags ?? []), 'hidden'] });
  }

  const { storage_asset_presets: presets } = await call('GET', '/settings?fields=storage_asset_presets');
  if ((presets ?? []).some((p) => p.key === MINI.key)) {
    console.log('asset preset "mini": already there');
  } else {
    console.log('asset preset "mini": add (64 x 64, cover, webp)');
    if (apply) await call('PATCH', '/settings', { storage_asset_presets: [...(presets ?? []), MINI] });
  }
} else {
  // migrate-questions.mjs leaves only the codes no product has (21 locally): many more means it hasn't run yet - and
  // before the deploy the old site still sends the old fields, its questions would fail
  const left = await call(
    'GET',
    '/items/questions?filter[content][_starts_with]=%23%20Kod%3A&filter[product][_null]=true&aggregate[count]=id',
  );
  console.log(`questions still with a "# Kod:" line and no product: ${left[0]?.count?.id ?? left[0]?.count ?? '?'}\n`);
  for (const [collection, action, , remove] of PUBLIC) {
    if (!remove.length) continue;
    const permission = await publicPermission(collection, action);
    const fields = (permission?.fields ?? []).filter((f) => !remove.includes(f));
    if (permission && fields.length !== (permission.fields ?? []).length) {
      console.log(`Public, ${collection} ${action} (#${permission.id}): - ${remove.join(', ')}`);
      if (apply) await call('PATCH', `/permissions/${permission.id}`, { fields });
    } else {
      console.log(`Public, ${collection} ${action}: already without ${remove.join(', ')}`);
    }
  }
  for (const field of OLD_QUESTION_FIELDS) {
    if (await has('questions', field)) {
      console.log(`questions.${field}: delete`);
      if (apply) await call('DELETE', `/fields/questions/${field}`);
    } else {
      console.log(`questions.${field}: already gone`);
    }
  }
}

console.log(apply ? '\ndone' : '\nnothing was changed');
