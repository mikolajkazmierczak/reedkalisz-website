import api from '$/api';
import { makeTree } from '%/utils';
import { enabledFilter, countProducts } from '#/products/fields';
import { preloadSlider } from '#/products/slider';
import { cached, SERVER_MAX_AGE } from '$lib/server/cache';

/** Item counts per top-level section, in the rail's order: one distinct count each, cheap enough to run live. */
async function catalogueSummary(tree) {
  const ids = (node) => [node.id, ...node.children.flatMap(ids)];
  // Three levels: section, subcategories, leaves.
  const branch = ({ id, name, slug, children }) => ({ id, name, slug, children: children.map(branch) });
  const [total, ...counts] = await Promise.all([
    countProducts(api, enabledFilter),
    ...tree.map((node) => countProducts(api, { ...enabledFilter, categories: { category: { _in: ids(node) } } })),
  ]);
  const sections = tree
    .map((node, i) => ({ ...branch(node), href: `/kategorie/${node.slug}`, count: counts[i] }))
    .filter((s) => s.count > 0);
  return { total, sections };
}

/** Each category block's first page, so the server render has its cards. */
async function preloadSliders(layout, categoriesItems, categoriesTree) {
  const slugs = [...new Set(layout.filter((e) => e.type === 'category' && e.slug).map((e) => e.slug))];
  const pages = await Promise.all(
    slugs.map((slug) =>
      cached(`slider:${slug}`, SERVER_MAX_AGE, () => preloadSlider(api, slug, categoriesItems, categoriesTree)),
    ),
  );
  return Object.fromEntries(slugs.map((slug, i) => [slug, pages[i]]));
}

/** Server-side, so the browser doesn't fetch it all again on hydration. */
export async function load({ depends, parent }) {
  // the editor invalidates this after saving
  depends('website:layout');
  const [{ categoriesItems }, { data: layout }] = await Promise.all([parent(), api.items('fragments').readOne(12)]);
  const categoriesTree = makeTree(categoriesItems.filter((c) => c.enabled));
  const [summary, sliders] = await Promise.all([
    cached('summary', SERVER_MAX_AGE, () => catalogueSummary(categoriesTree)),
    preloadSliders(layout, categoriesItems, categoriesTree),
  ]);
  return { layout, summary, sliders };
}
