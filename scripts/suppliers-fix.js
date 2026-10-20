#!/usr/bin/env node
//
// Re-keys or removes the AXPOL products that the old parseCode() merged together.
//
// AXPOL CodeERP has three schemes. The dot one is `PREFIX.<2-digit product><1-2 digit colour>`,
// but parseCode() treated everything after the dot as colour, so every sub-product collapsed
// into one row: P322 alone held 41 distinct products. Fixing the adapter changes the product
// code for every dot-scheme product, so the rows already in the database have to follow.
//
// The plan below is explicit on purpose. Picking the surviving sub-product automatically looks
// tempting but gets it wrong: the largest bucket under P322 is P322.42 ("Power bank 4000 mAh
// z aluminium"), while the row's own name, slug and description are P322.08's. A migration that
// guesses would silently hand one product's curation to another.
//
// Talks to Directus over REST (not straight to sqlite) so revisions, cascades and hooks
// behave exactly as they do in the admin UI.
//
//   node scripts/suppliers-fix.js               # dry run, prints the plan, writes nothing
//   node scripts/suppliers-fix.js --apply       # execute it
//   node scripts/suppliers-fix.js --url http://localhost:8055 --token XXX
//
// Reads API and DIRECTUS_TOKEN from backend/heimdall/.env when the flags are absent.
//

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMPANY = 'AXPOL';

// ---------------------------------------------------------------- the plan
//
// Derived from the 2026-08-26 Product.List feed (10,659 rows). `expectStorages` is a
// tripwire, not a filter: if production has drifted from what this plan was written
// against, the run stops rather than acting on a shape nobody checked.
//
// To keep P322 instead of deleting it, swap its entry for:
//   { code: 'P322', action: 'rekey', newCode: 'P322.08', ... }
// Its name and description already belong to P322.08, so that one is safe.

const PLAN = [
  {
    code: 'P169',
    action: 'delete',
    expectStorages: 1,
    reason: 'disabled, and no longer in the AXPOL catalogue (0 feed rows)',
  },
  {
    code: 'P780',
    action: 'delete',
    expectStorages: 1,
    reason: 'disabled, and no longer in the AXPOL catalogue (0 feed rows)',
  },
  {
    code: 'P322',
    action: 'delete',
    expectStorages: 89,
    reason: 'disabled, 41 distinct products merged into one row (37-320 PLN)',
  },
  {
    code: 'P165',
    action: 'rekey',
    newCode: 'P165.13',
    expectStorages: 3,
    reason: 'live; .132 is the only variant still in the feed, .142/.509 are other products',
  },
  {
    code: 'P457',
    action: 'rekey',
    newCode: 'P457.00',
    expectStorages: 1,
    reason: 'live; code spans 8 products but only the clock (.0019) was ever imported',
  },
  {
    code: 'P915',
    action: 'rekey',
    newCode: 'P915.01',
    expectStorages: 2,
    reason: 'live and already correct; .0101/.0125 are colours 01 and 25 of one product',
  },
];

// ---------------------------------------------------------------- args + env

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 ? argv[i + 1] : null;
};

const APPLY = flag('apply');
const FORCE = flag('force'); // proceed even when storage counts have drifted

function readEnvFile(file) {
  // heimdall's .env, parsed the same way dotenv would
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=');
        return [
          l.slice(0, i).trim(),
          l
            .slice(i + 1)
            .trim()
            .replace(/^["']|["']$/g, ''),
        ];
      }),
  );
}

const env = readEnvFile(path.join(REPO, 'backend/heimdall/.env'));
const URL_ = (opt('url') || process.env.API || env.API || '').replace(/\/+$/, '');
const TOKEN = opt('token') || process.env.DIRECTUS_TOKEN || env.DIRECTUS_TOKEN || '';

if (!URL_ || !TOKEN) {
  console.error('Missing Directus URL or token.');
  console.error('Pass --url/--token, or set API and DIRECTUS_TOKEN in backend/heimdall/.env');
  process.exit(1);
}

// ---------------------------------------------------------------- directus

async function api(method, endpoint, body) {
  const res = await fetch(`${URL_}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${method} ${endpoint} -> ${res.status} ${res.statusText}\n${text.slice(0, 400)}`);
  }
  if (res.status === 204) return null;
  return (await res.json()).data;
}

// ---------------------------------------------------------------- the rule
//
// The adapter's own parseCode, not a copy of it. This script has to group rows exactly the
// way the next sync will, so a second implementation drifting out of step is the one bug
// that would quietly mis-key everything. Needs heimdall's node_modules (it is installed
// wherever heimdall runs, which is anywhere this script is worth running).

let parseCode;
try {
  ({ parseCode } = await import(path.join(REPO, 'backend/heimdall/api/companies/AXPOL.js')));
} catch (err) {
  console.error(`Could not load the AXPOL adapter from ${REPO}/backend/heimdall.`);
  console.error('This script resolves the adapter and .env relative to itself, so it has to sit');
  console.error('in the repo at scripts/suppliers-fix.js — and heimdall needs its npm install.');
  console.error(err.message);
  process.exit(1);
}

// A storage row stores only the colour half, so rebuild the full CodeERP first.
const fullCode = (productCode, colorCode) => `${productCode}${colorCode ?? ''}`;

// A product is dot-scheme only if its variants carry a bare `.NNN`/`.NNNN` colour code.
// The product code alone cannot tell you: `P165` and `HE559` look identical, but HE559's
// variants are `-16`, which the old rule already grouped correctly. Apparel (`.NNN.XL`)
// is excluded by the anchors, and is likewise already correct.
const DOT_COLOR = /^\.\d{3,4}$/;

// ---------------------------------------------------------------- run

async function main() {
  console.log(`\n  Directus : ${URL_}`);
  console.log(`  Mode     : ${APPLY ? 'APPLY (writes)' : 'dry run (no writes)'}\n`);

  const companies = await api('GET', `/items/companies?filter[name][_eq]=${COMPANY}&fields=id,name`);
  if (!companies?.length) throw new Error(`company "${COMPANY}" not found`);
  const companyId = companies[0].id;

  const products = await api(
    'GET',
    `/items/products?filter[company][_eq]=${companyId}&fields=id,code,name,enabled&limit=-1&sort=code`,
  );
  const byCode = new Map(products.map((p) => [p.code, p]));
  const byId = new Map(products.map((p) => [p.id, p]));

  // Every AXPOL variant in one call, then grouped locally — one request beats 1,474.
  const allStorages = await api(
    'GET',
    `/items/products_storage?filter[product][company][_eq]=${companyId}` +
      `&fields=id,product,api_color_code,amount,enabled&limit=-1&sort=index`,
  );
  const storagesOf = new Map();
  for (const s of allStorages) {
    const key = typeof s.product === 'object' ? s.product?.id : s.product;
    if (!storagesOf.has(key)) storagesOf.set(key, []);
    storagesOf.get(key).push(s);
  }

  // Anything dot-scheme that the plan does not mention is drift worth seeing.
  const planned = new Set(PLAN.map((s) => s.code));
  const unplanned = [...storagesOf.entries()]
    .filter(([id, ss]) => ss.some((s) => DOT_COLOR.test(s.api_color_code || '')) && !planned.has(byId.get(id)?.code))
    .map(([id]) => byId.get(id))
    .filter(Boolean);

  const jobs = [];
  const problems = [];

  for (const step of PLAN) {
    const product = byCode.get(step.code);
    if (!product) {
      problems.push(`${step.code}: not present (already migrated, or never imported) — skipping`);
      continue;
    }
    const storages = storagesOf.get(product.id) ?? [];
    if (storages.length !== step.expectStorages) {
      problems.push(
        `${step.code}: expected ${step.expectStorages} storage rows, found ${storages.length}` +
          (FORCE ? ' — proceeding (--force)' : ' — SKIPPING'),
      );
      if (!FORCE) continue;
    }

    const keep = [];
    const drop = [];
    for (const s of storages) {
      const parsed = parseCode(fullCode(product.code, s.api_color_code));
      const target = { storage: s, colorCode: parsed?.colorCode ?? s.api_color_code };
      if (step.action === 'rekey' && parsed?.productCode === step.newCode) keep.push(target);
      else drop.push(target);
    }
    if (step.action === 'rekey' && keep.length === 0) {
      problems.push(`${step.code}: no storage row resolves to ${step.newCode} — SKIPPING`);
      continue;
    }
    jobs.push({ step, product, storages, keep, drop });
  }

  // ------------------------------------------------------------ report
  for (const { step, product, storages, keep, drop } of jobs) {
    console.log(
      `  ${product.enabled ? 'LIVE ' : 'off  '} #${product.id}  ${product.code.padEnd(8)} "${product.name.slice(0, 44)}"`,
    );
    console.log(`         ${step.reason}`);
    if (step.action === 'delete') {
      console.log(`         DELETE — cascades ${storages.length} storage row(s) and their images`);
    } else {
      console.log(`         code ${product.code} -> ${step.newCode}`);
      for (const k of keep) {
        console.log(`             keep  ${String(k.storage.api_color_code).padEnd(7)} -> ${k.colorCode}`);
      }
      for (const d of drop) {
        const belongs = parseCode(fullCode(product.code, d.storage.api_color_code))?.productCode ?? '?';
        console.log(
          `             drop  ${String(d.storage.api_color_code).padEnd(7)} (belongs to ${belongs}` +
            `${d.storage.enabled ? ', ENABLED' : ''})`,
        );
      }
    }
    console.log('');
  }

  if (problems.length) {
    console.log('  Attention:');
    problems.forEach((p) => console.log(`    - ${p}`));
    console.log('');
  }
  if (unplanned.length) {
    console.log(`  ${unplanned.length} dot-scheme product(s) not covered by the plan:`);
    unplanned.forEach((p) => console.log(`    - #${p.id} ${p.code} "${p.name.slice(0, 40)}"`));
    console.log('    Re-run the audit before migrating these.\n');
  }

  const dels = jobs.filter((j) => j.step.action === 'delete').length;
  const keys = jobs.filter((j) => j.step.action === 'rekey').length;
  const dropped = jobs.reduce((n, j) => n + (j.step.action === 'rekey' ? j.drop.length : 0), 0);
  console.log(
    `  ${jobs.length} product(s) to change: ${keys} re-key, ${dels} delete, ${dropped} storage rows dropped\n`,
  );

  if (!jobs.length) return;
  if (!APPLY) {
    console.log('  Dry run — nothing written. Re-run with --apply to execute.\n');
    return;
  }

  // ------------------------------------------------------------ apply
  for (const { step, product, keep, drop } of jobs) {
    if (step.action === 'delete') {
      await api('DELETE', `/items/products/${product.id}`);
      console.log(`  deleted  #${product.id} ${product.code}`);
      continue;
    }
    // Storage rows first: if this run dies halfway, the product still owns a consistent set.
    for (const d of drop) await api('DELETE', `/items/products_storage/${d.storage.id}`);
    for (const k of keep) {
      if (k.storage.api_color_code === k.colorCode) continue;
      await api('PATCH', `/items/products_storage/${k.storage.id}`, { api_color_code: k.colorCode });
    }
    // Slug is deliberately left alone: it is a public URL, and it carries the old code only
    // as a prefix, not as an identity the sync reads back.
    await api('PATCH', `/items/products/${product.id}`, { code: step.newCode });
    console.log(`  re-keyed #${product.id} ${product.code} -> ${step.newCode} (dropped ${drop.length})`);
  }

  console.log(`\n  Done. Image files belonging to deleted products are NOT removed —`);
  console.log(`  clean them from Directus > Files once you have checked them.\n`);
}

main().catch((err) => {
  console.error(`\n  FAILED: ${err.message}\n`);
  process.exit(1);
});
