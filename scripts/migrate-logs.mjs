#!/usr/bin/env node
//
// The scans' and the recalculations' logs: api_logs and calculations_logs, in a "Logs" folder.
//
//   node scripts/migrate-logs.mjs           # dry run: prints what would change
//   node scripts/migrate-logs.mjs --apply   # makes the changes: BEFORE the deploy (the admin writes to them)
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env, `API=...` in
// front to point it elsewhere): the same requests the admin panel sends from Settings > Data Model, so Directus writes
// its own `directus_fields` / `directus_relations` rows. Anything already there is left as it is, so running it again
// changes nothing. Admin-only: Public reads neither.
//
// - api_logs: one row per scan of a company's api - who started it (user_created), when, how it ended (status,
//   error, date_finished), what it would change (warnings: the outage question it asked) and what it changed (counts,
//   changes: the product ids of each kind)
// - calculations_logs: one row per recalculation of prices - who and when, what started it (trigger), the filter and
//   options it ran with, how many products it went through and which came out different (changed); a scan's points at
//   its api_logs row (scan)
// See frontend/src/lib/admin/logs.js.
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

const id = {
  field: 'id',
  type: 'integer',
  schema: { is_primary_key: true, has_auto_increment: true },
  meta: { interface: 'input', readonly: true, hidden: true, width: 'full' },
};
// as questions' (who started it: the admin's own session makes the row, see logs.js)
const userCreated = {
  field: 'user_created',
  type: 'uuid',
  schema: {},
  meta: {
    special: ['user-created'],
    interface: 'select-dropdown-m2o',
    options: { template: '{{avatar.$thumbnail}} {{first_name}} {{last_name}}' },
    display: 'user',
    readonly: true,
    width: 'half',
  },
};
const dateCreated = {
  field: 'date_created',
  type: 'timestamp',
  schema: {},
  meta: {
    special: ['date-created', 'cast-timestamp'],
    interface: 'datetime',
    display: 'datetime',
    display_options: { relative: true },
    readonly: true,
    width: 'half',
  },
};
const dateFinished = {
  field: 'date_finished',
  type: 'timestamp',
  schema: {},
  meta: {
    special: ['cast-timestamp'],
    interface: 'datetime',
    display: 'datetime',
    readonly: true,
    width: 'half',
    note: 'Puste: w toku albo przerwane (zamknięta strona, przeglądarka)',
  },
};
const status = (choices) => ({
  field: 'status',
  type: 'string',
  schema: {},
  meta: {
    interface: 'select-dropdown',
    options: { choices: choices.map(([value, text]) => ({ value, text })) },
    display: 'labels',
    readonly: true,
    width: 'half',
  },
});
const text = (field, note) => ({
  field,
  type: 'text',
  schema: {},
  meta: { interface: 'input-multiline', readonly: true, width: 'full', note },
});
const json = (field, note) => ({
  field,
  type: 'json',
  schema: {},
  meta: {
    special: ['cast-json'],
    interface: 'input-code',
    options: { language: 'JSON' },
    readonly: true,
    width: 'full',
    note,
  },
});
const m2o = (field, template, note) => ({
  field,
  type: 'integer',
  schema: {},
  meta: {
    interface: 'select-dropdown-m2o',
    options: { template },
    display: 'related-values',
    readonly: true,
    width: 'half',
    note,
  },
});

const FOLDER = { collection: 'Logs', meta: { icon: 'history', sort: 10 }, schema: null };

const COLLECTIONS = [
  {
    collection: 'api_logs',
    meta: {
      icon: 'cloud_sync',
      group: 'Logs',
      sort: 1,
      accountability: 'all',
      display_template: '{{company.name}} {{date_created}}',
    },
    schema: {},
    fields: [
      id,
      m2o('company', '{{name}}', 'Skanowany dostawca'),
      status([
        ['running', 'W toku'],
        ['done', 'Zapisany'],
        ['skipped', 'Niezapisany'],
        ['refused', 'Niemożliwy'],
        ['error', 'Błąd'],
      ]),
      userCreated,
      dateCreated,
      dateFinished,
      text('error', 'Dlaczego się nie udał'),
      json('warnings', 'O co zapytał przed zapisem (wyglądało na awarię API)'),
      json('counts', 'Ile czego: produkty w API i w bazie, zmienione wg rodzaju, dodane i usunięte wiersze'),
      json('changes', 'Id produktów wg rodzaju zmiany'),
    ],
  },
  {
    collection: 'calculations_logs',
    meta: {
      icon: 'calculate',
      group: 'Logs',
      sort: 2,
      accountability: 'all',
      display_template: '{{trigger}} {{date_created}}',
    },
    schema: {},
    fields: [
      id,
      {
        field: 'trigger',
        type: 'string',
        schema: {},
        meta: {
          interface: 'input',
          readonly: true,
          width: 'half',
          note: 'Co je uruchomiło (scan, import, duplicate, global_margins, price_view, labeling, super, other)',
        },
      },
      status([
        ['running', 'W toku'],
        ['done', 'Gotowe'],
        ['error', 'Błąd'],
      ]),
      userCreated,
      dateCreated,
      dateFinished,
      m2o('scan', '{{company.name}} {{date_created}}', 'Skan, po którym przeliczono'),
      {
        field: 'products',
        type: 'integer',
        schema: {},
        meta: { interface: 'input', readonly: true, width: 'half', note: 'Ile produktów przeliczono' },
      },
      json('changed', 'Id produktów, których ceny się zmieniły'),
      json('filter', 'Które produkty'),
      json('options', 'newPriceView, swapLabelings'),
      text('error', 'Dlaczego się nie udało'),
    ],
  },
];

// (who or what a log points at can go: the log stays, without it)
const setNull = (collection, field, related_collection) => ({
  collection,
  field,
  related_collection,
  schema: { on_delete: 'SET NULL' },
  meta: { one_deselect_action: 'nullify' },
});
const RELATIONS = [
  setNull('api_logs', 'user_created', 'directus_users'),
  setNull('calculations_logs', 'user_created', 'directus_users'),
  setNull('api_logs', 'company', 'companies'),
  setNull('calculations_logs', 'scan', 'api_logs'),
];

console.log(`${apply ? 'APPLYING' : 'DRY RUN (add --apply to make the changes)'} on ${API}\n`);

const collections = (await call('GET', '/collections')).map((c) => c.collection);

for (const collection of [FOLDER, ...COLLECTIONS]) {
  const name = collection.collection;
  if (collections.includes(name)) {
    console.log(`${name}: already there`);
  } else {
    const what = collection.fields ? `(${collection.fields.map((f) => f.field).join(', ')})` : '(folder)';
    console.log(`${name}: create ${what}`);
    if (apply) await call('POST', '/collections', collection);
  }
}

const relations = await call('GET', '/relations');
for (const relation of RELATIONS) {
  const name = `${relation.collection}.${relation.field}`;
  if (relations.some((r) => r.collection === relation.collection && r.field === relation.field)) {
    console.log(`${name}: its relation to ${relation.related_collection} is already there`);
  } else {
    console.log(`${name}: relate to ${relation.related_collection} (on delete SET NULL)`);
    if (apply) await call('POST', '/relations', relation);
  }
}
