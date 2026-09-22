#!/usr/bin/env node
//
// Re-keys or removes the products whose identity the AXPOL and USBSystem adapter fixes changed.
//
// AXPOL CodeERP has three schemes. The dot one is `PREFIX.<2-digit product><1-2 digit colour>`,
// but parseCode() treated everything after the dot as colour, so every sub-product collapsed
// into one row: P322 alone held 41 distinct products. Fixing the adapter changes the product
// code for every dot-scheme product, so the rows already in the database have to follow.
//
// USBSystem has no product codes, so the adapter used `slugify(name)` plus a positional counter
// (`pd-6`, `pd-6-1`, ...) that changed whenever the feed reordered. The code is now the last
// segment of the product's link (`1-pd-6`, `m-pd-6`), which the database rows cannot derive
// themselves, so the plan spells the mapping out and checks the name before applying it.
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

// ---------------------------------------------------------------- the plan
//
// Derived from the 2026-08-26 Product.List feed (10,659 rows) and re-checked against the
// 2026-09-22 one (10,835 rows) and the production database of the same day. `expectStorages`
// and `expectName` are tripwires, not filters: if production has drifted from what this plan
// was written against, the step is skipped rather than acting on a shape nobody checked.
//
// To keep P322 instead of deleting it, swap its entry for:
//   { code: 'P322', action: 'rekey', newCode: 'P322.08', ... }
// Its name and description already belong to P322.08, so that one is safe.

const PLAN = [
  {
    company: 'AXPOL',
    code: 'P169',
    action: 'delete',
    expectStorages: 1,
    reason: 'disabled, and no longer in the AXPOL catalogue (0 feed rows)',
  },
  {
    company: 'AXPOL',
    code: 'P780',
    action: 'delete',
    expectStorages: 1,
    reason: 'disabled, and no longer in the AXPOL catalogue (0 feed rows); already gone from production',
  },
  {
    company: 'AXPOL',
    code: 'P322',
    action: 'delete',
    expectStorages: 89,
    reason: 'disabled, 41 distinct products merged into one row (37-320 PLN)',
  },
  {
    company: 'AXPOL',
    code: 'P165',
    action: 'rekey',
    newCode: 'P165.13',
    expectStorages: 3,
    reason: 'live; .132 is the only variant still in the feed, .142/.509 are other products',
  },
  {
    company: 'AXPOL',
    code: 'P457',
    action: 'rekey',
    newCode: 'P457.00',
    expectStorages: 1,
    reason: 'live; code spans 8 products but only the clock (.0019) was ever imported',
  },
  {
    company: 'AXPOL',
    code: 'P915',
    action: 'rekey',
    newCode: 'P915.01',
    expectStorages: 2,
    reason: 'live and already correct; .0101/.0125 are colours 01 and 25 of one product',
  },
  // USBSystem: the two rows ever imported are both the PD-6 pendrive, told apart by capacity range.
  // The old positional suffix said nothing about which was which; the link segment does.
  {
    company: 'USBSystem',
    code: 'pd-6',
    action: 'rekey',
    newCode: '1-pd-6',
    expectStorages: 1,
    expectName: 'PD-6 1GB/2GB/4GB/8GB/16GB/32GB/64GB/128GB',
    reason: 'disabled; the 1GB-128GB PD-6, link segment 1-pd-6',
  },
  {
    company: 'USBSystem',
    code: 'pd-6-1',
    action: 'rekey',
    newCode: 'm-pd-6',
    expectStorages: 1,
    expectName: 'PD-6 1GB/2GB/4GB/8GB/16GB/32GB/64GB/128GB/256GB/512GB',
    reason: 'disabled; the 1GB-512GB PD-6, link segment m-pd-6',
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
// AXPOL: the adapter's own parseCode, not a copy of it. This script has to group rows exactly
// the way the next sync will, so a second implementation drifting out of step is the one bug
// that would quietly mis-key everything. Needs heimdall's node_modules (it is installed
// wherever heimdall runs, which is anywhere this script is worth running).
//
// USBSystem: the new identity comes from the feed's link, which the rows do not carry, so it
// is taken from the plan; a storage row's api_color_code is the product code itself.

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

// What the next sync will make of a storage row: { productCode, colorCode }
const resolvers = {
  AXPOL: (step, product, storage) => parseCode(fullCode(product.code, storage.api_color_code)),
  USBSystem: (step) => ({ productCode: step.newCode, colorCode: step.newCode }),
};

// A product is dot-scheme only if its variants carry a bare `.NNN`/`.NNNN` colour code.
// The product code alone cannot tell you: `P165` and `HE559` look identical, but HE559's
// variants are `-16`, which the old rule already grouped correctly. Apparel (`.NNN.XL`)
// is excluded by the anchors, and is likewise already correct.
const DOT_COLOR = /^\.\d{3,4}$/;

// ---------------------------------------------------------------- run

async function main() {
  console.log(`\n  Directus : ${URL_}`);
  console.log(`  Mode     : ${APPLY ? 'APPLY (writes)' : 'dry run (no writes)'}\n`);

  const jobs = [];
  const problems = [];
  const unplanned = [];
  const detaching = [];

  for (const companyName of [...new Set(PLAN.map((s) => s.company))]) {
    const companies = await api('GET', `/items/companies?filter[name][_eq]=${companyName}&fields=id,name,api_flags`);
    if (!companies?.length) throw new Error(`company "${companyName}" not found`);
    const companyId = companies[0].id;
    const apiFlags = companies[0].api_flags ?? {};

    const products = await api(
      'GET',
      `/items/products?filter[company][_eq]=${companyId}&fields=id,code,name,enabled&limit=-1&sort=code`,
    );
    const byCode = new Map(products.map((p) => [p.code, p]));
    const byId = new Map(products.map((p) => [p.id, p]));

    // Every variant in one call, then grouped locally — one request beats 1,474.
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

    const steps = PLAN.filter((s) => s.company === companyName);
    const planned = new Set(steps.map((s) => s.code));

    if (companyName === 'AXPOL') {
      // Anything dot-scheme that the plan does not mention is drift worth seeing.
      unplanned.push(
        ...[...storagesOf.entries()]
          .filter(
            ([id, ss]) => ss.some((s) => DOT_COLOR.test(s.api_color_code || '')) && !planned.has(byId.get(id)?.code),
          )
          .map(([id]) => byId.get(id))
          .filter(Boolean),
      );
      // The old rule also folded `V4088/A-02` into V4088 as colour `/A-02`. The product code stays
      // valid, so nothing to re-key: the next sync detaches those colours as gone (disabled, amount 0)
      // and V4088/A can be imported on its own. Listed so that the drop in colours is not a surprise.
      for (const [id, ss] of storagesOf) {
        const sub = ss.filter((s) => (s.api_color_code || '').startsWith('/') && s.enabled);
        if (sub.length) detaching.push({ product: byId.get(id), colours: sub.map((s) => s.api_color_code) });
      }
    }

    for (const step of steps) {
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
      if (step.expectName && product.name !== step.expectName) {
        problems.push(
          `${step.code}: expected name "${step.expectName}", found "${product.name}"` +
            (FORCE ? ' — proceeding (--force)' : ' — SKIPPING'),
        );
        if (!FORCE) continue;
      }

      const resolve = resolvers[companyName];
      const keep = [];
      const drop = [];
      for (const s of storages) {
        const parsed = resolve(step, product, s);
        const target = { storage: s, colorCode: parsed?.colorCode ?? s.api_color_code };
        if (step.action === 'rekey' && parsed?.productCode === step.newCode) keep.push(target);
        else drop.push(target);
      }
      if (step.action === 'rekey' && keep.length === 0) {
        problems.push(`${step.code}: no storage row resolves to ${step.newCode} — SKIPPING`);
        continue;
      }
      // The admin's per-product flags (done, edit, ...) are keyed `<Company>/<code>`, so they follow the code.
      const uid = `${companyName}/${product.code}`;
      const flags = Object.keys(apiFlags).filter((k) => apiFlags[k]?.includes(uid));
      jobs.push({ step, product, storages, keep, drop, resolve, companyId, apiFlags, uid, flags });
    }
  }

  // ------------------------------------------------------------ report
  for (const { step, product, storages, keep, drop, resolve, flags } of jobs) {
    console.log(
      `  ${product.enabled ? 'LIVE ' : 'off  '} ${step.company.padEnd(9)} #${product.id}  ${product.code.padEnd(8)} "${product.name.slice(0, 44)}"`,
    );
    console.log(`         ${step.reason}`);
    if (step.action === 'delete') {
      console.log(`         DELETE — cascades ${storages.length} storage row(s) and their images`);
      if (flags.length) console.log(`         flag ${flags.join(', ')} removed`);
    } else {
      console.log(`         code ${product.code} -> ${step.newCode}`);
      if (flags.length) console.log(`         flag ${flags.join(', ')} follows the new code`);
      for (const k of keep) {
        console.log(`             keep  ${String(k.storage.api_color_code).padEnd(7)} -> ${k.colorCode}`);
      }
      for (const d of drop) {
        const belongs = resolve(step, product, d.storage)?.productCode ?? '?';
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
  if (detaching.length) {
    console.log(
      `  ${detaching.length} product(s) with live sub-variant colours the next sync will disable (no action):`,
    );
    detaching.forEach(({ product: p, colours }) =>
      console.log(`    - #${p.id} ${p.code.padEnd(7)} ${colours.join(' ').padEnd(28)} "${p.name.slice(0, 40)}"`),
    );
    console.log('    Import the sub-variant (e.g. V4088/A) as its own product afterwards if it is still wanted.\n');
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
  const moveFlags = async ({ companyId, apiFlags, uid, flags, step }) => {
    if (!flags.length) return;
    const newUid = step.action === 'rekey' ? uid.replace(/\/[^/]*$/, `/${step.newCode}`) : null;
    for (const key of flags) {
      apiFlags[key] = apiFlags[key].filter((u) => u !== uid);
      if (newUid) apiFlags[key].push(newUid);
    }
    // `apiFlags` is the same object for every job of a company, so each write carries all changes so far
    await api('PATCH', `/items/companies/${companyId}`, { api_flags: apiFlags });
  };

  for (const job of jobs) {
    const { step, product, keep, drop } = job;
    if (step.action === 'delete') {
      await api('DELETE', `/items/products/${product.id}`);
      await moveFlags(job);
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
    await moveFlags(job);
    console.log(`  re-keyed #${product.id} ${product.code} -> ${step.newCode} (dropped ${drop.length})`);
  }

  console.log(`\n  Done. Image files belonging to deleted products are NOT removed —`);
  console.log(`  clean them from Directus > Files once you have checked them.\n`);
}

main().catch((err) => {
  console.error(`\n  FAILED: ${err.message}\n`);
  process.exit(1);
});
