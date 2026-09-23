import api from '$/api';
import { enabledFilter } from '#/products/fields';
import { SITE } from '#/seo';

/** Every public URL. Category pages show 25 products at a time, so this is how the rest get found. Cached for an hour. */
const TTL = 60 * 60 * 1000;
let cache = null;

async function build() {
  const [{ data: categories }, { data: products }] = await Promise.all([
    api.items('categories').readByQuery({ filter: { enabled: { _eq: true } }, fields: ['slug'], limit: -1 }),
    api.items('products').readByQuery({ filter: enabledFilter, fields: ['slug'], limit: -1 }),
  ]);

  const paths = [
    '/',
    '/kontakt',
    ...categories.map((c) => `/kategorie/${c.slug}`),
    ...products.map((p) => `/produkty/${p.slug}`),
    '/polityka-prywatnosci',
    '/obowiazek-informacyjny',
  ];
  const urls = paths
    .map((path) => `<url><loc>${SITE}${encodeURI(path).replaceAll('&', '&amp;')}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export async function GET() {
  if (!cache || Date.now() - cache.at > TTL) cache = { at: Date.now(), xml: await build() };
  return new Response(cache.xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
