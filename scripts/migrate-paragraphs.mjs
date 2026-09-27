// The paragraphs (commercial_details) lose their leading "---": the product page, the PDF card and the admin's preview
// draw their own line, so it would show twice.
//
//   node scripts/migrate-paragraphs.mjs           # dry run: prints what would change
//   node scripts/migrate-paragraphs.mjs --apply   # makes the changes
//
// Everything goes through the Directus API (heimdall's API + DIRECTUS_TOKEN from backend/heimdall/.env), never the
// database file. Run it right after the new website is deployed (the old one still needs the line in the content).

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

console.log(apply ? 'APPLYING\n' : 'DRY RUN (add --apply to make the changes)\n');

// a leading line of three or more dashes (or stars, underscores: markdown's rules), and the blank lines around it
const RULE = /^\s*([-*_])(\s*\1){2,}\s*\n/;

const paragraphs = await call('GET', '/items/commercial_details?fields=id,name,content&limit=-1');
for (const { id, name, content } of paragraphs) {
  if (!RULE.test(content ?? '')) {
    console.log(`#${id} ${name}: no line, stays`);
    continue;
  }
  const trimmed = content.replace(RULE, '');
  console.log(
    `#${id} ${name}: ${JSON.stringify(content.slice(0, 30))}... -> ${JSON.stringify(trimmed.slice(0, 30))}...`,
  );
  if (apply) await call('PATCH', `/items/commercial_details/${id}`, { content: trimmed });
}

console.log(apply ? '\ndone' : '\nnothing was changed');
