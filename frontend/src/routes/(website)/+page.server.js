import api from '$/api';
import { makeTree } from '%/utils';
import { enabledFilter } from '#/products/fields';

/**
 * Counts and price-from per top-level section. Reads the whole catalogue (~1 s), so it runs on the server only,
 * cached and refreshed in the background: the browser gets the result, never the sweep.
 */
const SUMMARY_TTL = 10 * 60 * 1000;
let summaryCache = null;

async function catalogueSummary() {
  const fresh = summaryCache && Date.now() - summaryCache.at < SUMMARY_TTL;
  if (fresh) return summaryCache.value;
  if (summaryCache) {
    // Serve the stale copy and refresh behind it.
    computeSummary()
      .then((value) => (summaryCache = { at: Date.now(), value }))
      .catch(() => {});
    return summaryCache.value;
  }
  const value = await computeSummary();
  summaryCache = { at: Date.now(), value };
  return value;
}

async function computeSummary() {
  const [{ data: categories }, { data: rows }] = await Promise.all([
    // the same query as the layout's, so the sections come in the rail's order
    api.items('categories').readByQuery({ fields: ['id', 'enabled', 'parent', 'index', 'name', 'slug'], limit: -1 }),
    api.items('products').readByQuery({ filter: enabledFilter, fields: ['price_min', 'categories.category'], limit: -1 }),
  ]);
  const tree = makeTree(categories.filter((c) => c.enabled));

  const ids = (node) => [node.id, ...node.children.flatMap(ids)];
  // Three levels: section, subcategories, leaves.
  const branch = ({ id, name, slug, children }) => ({ id, name, slug, children: children.map(branch) });

  const sections = tree
    .map((node) => {
      const own = new Set(ids(node));
      let count = 0;
      let from = null;
      for (const row of rows) {
        if (!row.categories?.some((c) => own.has(c.category))) continue;
        count++;
        if (row.price_min && (from === null || row.price_min < from)) from = row.price_min;
      }
      return { ...branch(node), href: `/kategorie/${node.slug}`, count, from };
    })
    .filter((s) => s.count > 0);

  return { total: rows.length, sections };
}

export async function load() {
  return { summary: await catalogueSummary() };
}
