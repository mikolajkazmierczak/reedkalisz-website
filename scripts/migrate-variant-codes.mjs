#!/usr/bin/env node
//
// A variant's code becomes its whole code: 'R123.10' instead of '10' next to the product's 'R123' (see
// frontend/src/routes/admin/api/match.js). Run right after deploying the heimdall that sends whole codes.
//
//   node scripts/migrate-variant-codes.mjs           # dry run: prints what would change
//   node scripts/migrate-variant-codes.mjs --apply   # makes the changes
//
// For the suppliers the whole codes come from the supplier itself: every supplier is scanned (heimdall's adapters, the
// same as the "Skanuj" button, nothing is written by that), and each of their variants' old code is worked out the
// way the old adapters cut it - so a variant of ours finds its whole code exactly as the old scan found it. A variant
// the supplier doesn't have any more gets its code put together by the supplier's rule. The last scan kept for each
// supplier (its snapshot) is changed the same way, so the API page keeps recognizing everything until the next scan.
// Other companies (REED...): the product's code and the variant's, as the website showed them ('DP-BOHO' + '/B-30').
// A code that is already whole is left as it is, so running it again changes nothing.
//
// Everything goes through the Directus API (API + DIRECTUS_TOKEN from backend/heimdall/.env).
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
const headers = { Authorization: `Bearer ${env.DIRECTUS_TOKEN}` };

async function call(method, url, body) {
  const res = await fetch(`${env.API}${url}`, {
    method,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${url}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : (await res.json()).data;
}

// how the old adapters cut a whole code: the part they kept as the variant's code
const oldCut = {
  // 'P437.3001' was 'P437.30' + '.01': the dot is in both
  AXPOL: (code, whole) => (whole === code ? '' : (code.includes('.') ? '.' : '') + whole.slice(code.length)),
  PAR: (code, whole) => whole.split('.').slice(1).join('.'),
  MidOcean: (code, whole) => whole.split('-').slice(1).join('-'),
  BlueCollection: (code, whole) => whole.split('-')[1] ?? '',
  USBSystem: (code, whole) => whole,
};
const cut = (name, code, whole) =>
  (oldCut[name] ?? ((code, whole) => (whole === code ? '' : whole.slice(Math.min(code.length, whole.length)))))(
    code,
    whole,
  );

// a whole code put together from the product's and the old variant's, as each supplier writes them
function compose(name, code, old, isApi) {
  if (!isApi) return old ? `${code}${old}` : old; // REED & co.: as the website showed it, empty stays empty
  if (!old) return code; // a product with one variant: the product's code is the variant's
  if (name === 'PAR') return `${code}.${old}`;
  if (name === 'MidOcean' || name === 'BlueCollection') return `${code}-${old}`;
  if (name === 'USBSystem') return old;
  if (name === 'AXPOL' && code.includes('.') && old.startsWith('.')) return `${code}${old.slice(1)}`; // 'P437.30' + '.01'
  return `${code}${old}`; // AXPOL ('-03', '.001.XL' carry their separator), EasyGifts, Macma, Promotionway
}

function companyEnv(name) {
  // API_<NAME>_<KEY>=value -> { key: value }, as heimdall does
  const prefix = `API_${name.toUpperCase()}`;
  return Object.fromEntries(
    Object.entries(env)
      .filter(([k]) => k.startsWith(prefix))
      .map(([k, v]) => [k.split('_').pop().toLowerCase(), v]),
  );
}

console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');

const adapters = (await import(path.join(root, 'backend/heimdall/api/index.js'))).default;
const companies = await call(
  'GET',
  '/items/companies?fields=id,name,api_snapshot,api_flags,api_discount,api_handling_costs&limit=-1',
);
const variants = await call(
  'GET',
  '/items/products_storage?fields=id,api_color_code,product.code,product.company&limit=-1',
);

const changes = []; // [{ id, api_color_code }]
const snapshots = []; // [{ company, file, items }]
let skipped = 0;

for (const company of companies) {
  const own = variants.filter((v) => v.product?.company === company.id);
  if (!own.length && !company.api_snapshot) continue;
  const isApi = !!adapters[company.name] && !!company.api_snapshot;

  // the supplier's variants now: old key ('product|old code') -> whole code
  let byOld = new Map();
  const wholes = new Set();
  if (isApi) {
    try {
      const { items } = await adapters[company.name].fetch({ company, env: companyEnv(company.name) });
      for (const item of items) {
        for (const s of item.storage) {
          const whole = s.api_color_code;
          if (!whole || !item.code) continue;
          wholes.add(whole);
          const key = `${item.code}|${cut(company.name, item.code, whole)}`;
          if (!byOld.has(key)) byOld.set(key, whole);
        }
      }
    } catch (e) {
      console.log(`!! ${company.name}: not scanned (${e.message}) - skipped, run again later`);
      skipped++;
      continue;
    }
  }

  const convert = (code, old) => {
    old = old ?? '';
    if (!code) return old;
    if (wholes.has(old) || (old && old.startsWith(code))) return old; // whole already
    return byOld.get(`${code}|${old}`) ?? compose(company.name, code, old, isApi);
  };

  let fromScan = 0;
  let composed = 0;
  const examples = [];
  for (const v of own) {
    const next = convert(v.product.code, v.api_color_code);
    if (next === (v.api_color_code ?? '')) continue;
    changes.push({ id: v.id, api_color_code: next });
    byOld.has(`${v.product.code}|${v.api_color_code ?? ''}`) ? fromScan++ : composed++;
    if (examples.length < 3) examples.push(`${v.product.code} + ${v.api_color_code ?? '∅'} -> ${next}`);
  }
  const unchanged = own.length - fromScan - composed;
  console.log(
    `${company.name.padEnd(15)} ${own.length} variants: ${fromScan} from the scan, ${composed} put together, ` +
      `${unchanged} unchanged${examples.length ? `   e.g. ${examples.join(', ')}` : ''}`,
  );

  // the last scan kept for the supplier, in the same codes
  if (isApi) {
    const res = await fetch(`${env.API}/assets/${company.api_snapshot}`, { headers });
    const items = await res.json();
    let changed = 0;
    for (const item of items) {
      for (const s of item.storage ?? []) {
        const next = convert(item.code, s.api_color_code);
        if (next !== (s.api_color_code ?? '')) {
          s.api_color_code = next;
          changed++;
        }
      }
    }
    if (changed) snapshots.push({ company, items });
    console.log(`${''.padEnd(15)} its last scan: ${changed} variant codes`);
  }
}

console.log(
  `\n${changes.length} variant codes to change, ${snapshots.length} snapshots${skipped ? `, ${skipped} suppliers skipped` : ''}`,
);

if (apply) {
  for (let i = 0; i < changes.length; i += 100) {
    await call('PATCH', '/items/products_storage?fields=id', changes.slice(i, i + 100));
  }
  for (const { company, items } of snapshots) {
    const form = new FormData();
    const name = `api_snapshot_${company.name.toLowerCase()}.json`;
    form.append('file', new Blob([JSON.stringify(items)], { type: 'application/json' }), name);
    const res = await fetch(`${env.API}/files/${company.api_snapshot}`, { method: 'PATCH', headers, body: form });
    if (!res.ok) throw new Error(`snapshot of ${company.name}: ${res.status} ${await res.text()}`);
  }
  console.log('done');
}
