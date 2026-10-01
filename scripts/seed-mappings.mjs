#!/usr/bin/env node
//
// Adds the proposed API mappings (places, categories, labelings) to the supplier companies.
//
//   node scripts/seed-mappings.mjs                  # dry run: prints what would be added
//   node scripts/seed-mappings.mjs --apply          # adds them
//   node scripts/seed-mappings.mjs MidOcean AXPOL   # only these companies (with or without --apply)
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env),
// never the database file, so Directus validates and logs it like an edit in the admin panel.
//
// The proposals are in scripts/assets/mappings/<Company>.json, in the columns' own formats:
//   { "places": [{ pattern, to }], "categories": [{ path, categories }], "labelings": [{ code, type, data }],
//     "removeLabelings": [{ code, type, data }], "replaceCategories": [{ path, from, to }] }
// They were worked out from what the admins did by hand before the scanner did it.
//
// - the rules a company already has are never changed: a proposal whose place pattern (any case), category path or
//   labeling code is already there is skipped, so running it again adds nothing
// - `removeLabelings` are rules to take out - broken ones (MidOcean's P1/P2 led to REED's RT1, which doesn't exist;
//   without them the codes import as MidOcean's own P1/P2) and useless ones (PAR's A0 -> PAR/A0, what the import does
//   anyway): one goes only while it's exactly as given - an admin's fix stays
// - `replaceCategories`: an existing category rule changed (its categories `from` -> `to`), likewise only while it's
//   still exactly `from`
// - a category rule pointing at a category that doesn't exist, or a labeling rule pointing at a labeling that
//   doesn't exist (e.g. before a labeling's code was renamed), is skipped and listed
// - only the columns that get something new are saved
// - careful with categories: once a company has category rules the scanner manages its products' categories -
//   a category any rule points at is removed from a product whose supplier categories don't lead to it
//
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const apply = process.argv.includes('--apply');
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'scripts/assets/mappings');
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

// a JSON column as a list (it may be null, or - on an old field - a string)
const list = (value) => {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  return Array.isArray(parsed) ? parsed : [];
};
const patternKey = (rule) => (rule.pattern ?? '').trim().toLowerCase();
const pathKey = (rule) => JSON.stringify(rule.path ?? []);
const sameIds = (a, b) => [...a].sort().join() === [...b].sort().join();
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sameRule = (a, b) => a.code === b.code && a.type === b.type && same(a.data, b.data);

console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');

const companies = await call(
  'GET',
  '/items/companies?fields=id,name,api_places_mappings,api_categories_mappings,api_labelings_mappings&limit=-1',
);
const categories = await call('GET', '/items/categories?fields=id,name&limit=-1');
const categoryName = new Map(categories.map((c) => [c.id, c.name]));
const labelings = await call('GET', '/items/labelings?fields=id,company,code&limit=-1');
const companyName = new Map(companies.map((c) => [c.id, c.name]));
const labelingExists = (company, code) => labelings.some((l) => l.company === company && l.code === code);

const files = fs.readdirSync(assets).filter((f) => f.endsWith('.json'));
const names = files.map((f) => f.slice(0, -'.json'.length)).filter((n) => !only.length || only.includes(n));
for (const name of only)
  if (!names.includes(name)) console.log(`no proposals for "${name}" (${path.relative(root, assets)})\n`);

let total = 0;
for (const name of names) {
  const company = companies.find((c) => c.name === name);
  if (!company) {
    console.log(`${name}: no such company, skipped\n`);
    continue;
  }
  const proposals = JSON.parse(fs.readFileSync(path.join(assets, `${name}.json`), 'utf8'));
  const places = list(company.api_places_mappings);
  const savedCats = list(company.api_categories_mappings);
  const savedLabs = list(company.api_labelings_mappings);
  const missingTo = [];
  const replace = (proposals.replaceCategories ?? []).filter((p) => {
    if (!savedCats.some((r) => pathKey(r) === pathKey(p) && sameIds(r.categories ?? [], p.from))) return false;
    const missing = p.to.filter((id) => !categoryName.has(id));
    if (missing.length) missingTo.push({ ...p, missing });
    return !missing.length;
  });
  const cats = savedCats.map((r) => {
    const p = replace.find((q) => pathKey(q) === pathKey(r));
    return p ? { ...r, categories: p.to } : r;
  });
  const remove = (proposals.removeLabelings ?? []).filter((p) => savedLabs.some((r) => sameRule(r, p)));
  const labs = savedLabs.filter((r) => !remove.some((p) => sameRule(r, p)));

  const newPlaces = (proposals.places ?? []).filter(
    (p, i, all) =>
      !places.some((r) => patternKey(r) === patternKey(p)) &&
      all.findIndex((q) => patternKey(q) === patternKey(p)) === i,
  );
  const missingCats = [];
  const newCats = (proposals.categories ?? []).filter((p) => {
    if (cats.some((r) => pathKey(r) === pathKey(p))) return false;
    const missing = p.categories.filter((id) => !categoryName.has(id));
    if (missing.length) missingCats.push({ ...p, missing });
    return !missing.length;
  });
  const missingLabs = [];
  const newLabs = (proposals.labelings ?? []).filter((p) => {
    if (labs.some((r) => r.code === p.code)) return false;
    // (an "ignore" rule has no targets: its data is null)
    const targets = [p.data]
      .flat()
      .filter(Boolean)
      .filter((t) => !labelingExists(t.company, t.code));
    if (targets.length) missingLabs.push({ ...p, targets });
    return !targets.length;
  });

  const skipped = (all, added) => (all ?? []).length - added.length;
  console.log(
    `${name}: ${newPlaces.length} place rules, ${newCats.length} category rules, ${newLabs.length} labeling rules to add` +
      ` (already there: ${skipped(proposals.places, newPlaces)} / ${skipped(proposals.categories, newCats) - missingCats.length}` +
      ` / ${skipped(proposals.labelings, newLabs) - missingLabs.length}; has ${places.length} / ${cats.length} / ${labs.length})`,
  );
  for (const r of newPlaces) console.log(`  place     "${r.pattern}" -> "${r.to}"`);
  for (const r of newCats) {
    const to = r.categories.length
      ? r.categories.map((id) => `#${id} ${categoryName.get(id)}`).join(', ')
      : '(kept out)';
    console.log(`  category  ${r.path.join(' > ')} -> ${to}`);
  }
  const target = (t) => `${companyName.get(t.company) ?? t.company}/${t.code}`;
  const thresholds = (data) => data.map((t) => `${t.type === 'gte' ? '≥' : '>'}${t.threshold} ${target(t)}`).join(', ');
  for (const r of newLabs) {
    const to = r.type === 'ignore' ? '(ignored)' : r.type === 'direct' ? target(r.data) : thresholds(r.data);
    console.log(`  labeling  ${r.code} -> ${r.type} ${to}`);
  }
  for (const r of [...missingCats, ...missingTo])
    console.log(`  SKIPPED category ${r.path.join(' > ')}: no category #${r.missing.join(', #')}`);
  for (const r of remove) console.log(`  REMOVE labeling ${r.code} -> ${target(r.data)}`);
  const named = (ids) => ids.map((id) => `#${id} ${categoryName.get(id)}`).join(', ');
  for (const r of replace) console.log(`  REPLACE category ${r.path.join(' > ')}: ${named(r.from)} -> ${named(r.to)}`);
  for (const r of missingLabs) {
    const t = r.targets.map((x) => `${companyName.get(x.company) ?? x.company}/${x.code}`).join(', ');
    console.log(`  SKIPPED labeling ${r.code}: no labeling ${t}`);
  }
  console.log();

  const data = {};
  if (newPlaces.length) data.api_places_mappings = [...places, ...newPlaces];
  if (newCats.length || replace.length) data.api_categories_mappings = [...cats, ...newCats];
  if (newLabs.length || remove.length) data.api_labelings_mappings = [...labs, ...newLabs];
  total += newPlaces.length + newCats.length + newLabs.length + remove.length + replace.length;
  if (apply && Object.keys(data).length) await call('PATCH', `/items/companies/${company.id}`, data);
}

console.log(`${total} rules ${apply ? 'added or removed' : 'to add or remove'}`);
console.log(apply ? 'done' : 'nothing was changed');
