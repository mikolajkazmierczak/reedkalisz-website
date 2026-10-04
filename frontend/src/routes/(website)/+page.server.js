import api from '$lib/server/api';
import { makeTree, treeGetAllChildrenIDs } from '%/utils';
import { enabledFilter, countProducts } from '#/products/fields';
import { categoryFilter } from '#/sections';
import { preloadSlider } from '#/products/slider';
import { cached, SERVER_MAX_AGE } from '$lib/server/cache';

/**
 * Every enabled product's categories, read once: the sections' counts (and the category sliders') are worked out from
 * it, not asked for one by one - Directus answers one request at a time, so ten counts took ten times as long.
 */
async function productCategories() {
  const { data } = await api.items('products_categories').readByQuery({
    fields: ['product', 'category'],
    filter: { product: enabledFilter },
    limit: -1,
  });
  return data;
}

/** Enabled products in a category and everything under it, as `countProducts` with `categoryFilter` counts them. */
function countIn(rows, id, tree) {
  const ids = new Set([id, ...treeGetAllChildrenIDs(tree, id)]);
  return new Set(rows.filter((row) => ids.has(row.category)).map((row) => row.product)).size;
}

/** Item counts per top-level section, in the rail's order (one with a flag - Nowości, Promocje - asked for: its flag). */
async function catalogueSummary(tree, rows) {
  // Three levels: section, subcategories, leaves.
  const branch = ({ id, name, slug, children }) => ({ id, name, slug, children: children.map(branch) });
  const [total, ...counts] = await Promise.all([
    countProducts(api, enabledFilter), // (products without a category too)
    ...tree.map((node) =>
      node.section ? countProducts(api, categoryFilter(node, tree)) : countIn(rows, node.id, tree),
    ),
  ]);
  const sections = tree
    .map((node, i) => ({ ...branch(node), href: `/kategorie/${node.slug}`, count: counts[i] }))
    .filter((s) => s.count > 0);
  return { total, sections };
}

/** Each category block's first page, so the server render has its cards (a plain category's count already known). */
async function preloadSliders(layout, categoriesItems, categoriesTree, rows) {
  const slugs = [...new Set(layout.filter((e) => e.type === 'category' && e.slug).map((e) => e.slug))];
  const count = (slug) => {
    const category = categoriesItems.find((c) => c.slug === slug && c.enabled);
    return category && !category.section ? countIn(rows, category.id, categoriesTree) : null; // (a section: its flag)
  };
  const pages = await Promise.all(
    slugs.map((slug) =>
      cached(`slider:${slug}`, SERVER_MAX_AGE, () =>
        preloadSlider(api, slug, categoriesItems, categoriesTree, [], count(slug)),
      ),
    ),
  );
  return Object.fromEntries(slugs.map((slug, i) => [slug, pages[i]]));
}

/**
 * Server-side, so the browser doesn't fetch it all again on hydration. The sliders' cards are streamed on in-site
 * navigation (the page shows at once, skeleton cards in their place, see CategorySlider) and awaited for a full page
 * load, so the HTML has them.
 */
export async function load({ depends, parent, isDataRequest }) {
  // the editor invalidates this after saving
  depends('website:layout');
  const [{ categoriesItems }, { data: layout }] = await Promise.all([parent(), api.items('fragments').readOne(12)]);
  const categoriesTree = makeTree(categoriesItems.filter((c) => c.enabled));
  const rows = cached('product-categories', SERVER_MAX_AGE, productCategories);
  const summary = cached('summary', SERVER_MAX_AGE, async () => catalogueSummary(categoriesTree, await rows));
  const sliders = rows.then((rows) => preloadSliders(layout, categoriesItems, categoriesTree, rows));
  sliders.catch(() => {}); // handled even when the summary fails first: an unhandled rejection ends the process
  return { layout, summary: await summary, sliders: isDataRequest ? sliders : await sliders };
}
