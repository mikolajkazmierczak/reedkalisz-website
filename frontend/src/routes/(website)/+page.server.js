import { dev } from '$app/environment';
import api from '$/api';
import { makeTree } from '%/utils';
import { enabledFilter } from '#/products/fields';
import { preloadSlider } from '#/products/slider';

/** Item counts per top-level section. Reads the whole catalogue (~1 s): server only, cached, refreshed behind. */
const SUMMARY_TTL = 10 * 60 * 1000;
let summaryCache = null;

async function catalogueSummary(tree) {
  // in dev, CMS edits show on the next load
  if (dev) return computeSummary(tree);
  const fresh = summaryCache && Date.now() - summaryCache.at < SUMMARY_TTL;
  if (fresh) return summaryCache.value;
  if (summaryCache) {
    // Serve the stale copy and refresh behind it.
    computeSummary(tree)
      .then((value) => (summaryCache = { at: Date.now(), value }))
      .catch(() => {});
    return summaryCache.value;
  }
  const value = await computeSummary(tree);
  summaryCache = { at: Date.now(), value };
  return value;
}

/** The layout's tree, so the sections come in the rail's order. */
async function computeSummary(tree) {
  const { data: rows } = await api
    .items('products')
    .readByQuery({ filter: enabledFilter, fields: ['categories.category'], limit: -1 });

  const ids = (node) => [node.id, ...node.children.flatMap(ids)];
  // Three levels: section, subcategories, leaves.
  const branch = ({ id, name, slug, children }) => ({ id, name, slug, children: children.map(branch) });

  const sections = tree
    .map((node) => {
      const own = new Set(ids(node));
      const count = rows.filter((row) => row.categories?.some((c) => own.has(c.category))).length;
      return { ...branch(node), href: `/kategorie/${node.slug}`, count };
    })
    .filter((s) => s.count > 0);

  return { total: rows.length, sections };
}

/** Each category block's first page, so the server render has its cards. */
async function preloadSliders(layout, categoriesItems, categoriesTree) {
  const slugs = [...new Set(layout.filter((e) => e.type === 'category' && e.slug).map((e) => e.slug))];
  const pages = await Promise.all(slugs.map((slug) => preloadSlider(api, slug, categoriesItems, categoriesTree)));
  return Object.fromEntries(slugs.map((slug, i) => [slug, pages[i]]));
}

/** Server-side, so the browser doesn't fetch it all again on hydration. */
export async function load({ depends, parent }) {
  // the editor invalidates this after saving
  depends('website:layout');
  const [{ categoriesItems }, { data: layout }] = await Promise.all([parent(), api.items('fragments').readOne(12)]);
  const categoriesTree = makeTree(categoriesItems.filter((c) => c.enabled));
  const [summary, sliders] = await Promise.all([
    catalogueSummary(categoriesTree),
    preloadSliders(layout, categoriesItems, categoriesTree),
  ]);
  return { layout, summary, sliders };
}
