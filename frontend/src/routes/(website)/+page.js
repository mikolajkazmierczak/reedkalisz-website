import api from '$/api';
import { treeGetAllChildrenIDs } from '%/utils';
import { enabledFilter } from '#/products/fields';

/** Counts and price-from per top-level section. Heavy (~1 s), so cached and refreshed in the background. */
const SUMMARY_TTL = 10 * 60 * 1000;
let summaryCache = null;

async function catalogueSummary(sideMenu, categoriesTree) {
  const fresh = summaryCache && Date.now() - summaryCache.at < SUMMARY_TTL;
  if (fresh) return summaryCache.value;
  if (summaryCache) {
    // Serve the stale copy and refresh behind it.
    computeSummary(sideMenu, categoriesTree)
      .then((value) => (summaryCache = { at: Date.now(), value }))
      .catch(() => {});
    return summaryCache.value;
  }
  const value = await computeSummary(sideMenu, categoriesTree);
  summaryCache = { at: Date.now(), value };
  return value;
}

async function computeSummary(sideMenu, categoriesTree) {
  const rows = (
    await api.items('products').readByQuery({
      filter: enabledFilter,
      fields: ['price_min', 'categories.category'],
      limit: -1,
    })
  ).data;

  const total = rows.length;

  const sections = sideMenu
    .map((item) => {
      const ids = new Set([item.category.id, ...treeGetAllChildrenIDs(categoriesTree, item.category.id)]);
      let count = 0;
      let from = null;
      for (const row of rows) {
        if (!row.categories?.some((c) => ids.has(c.category))) continue;
        count++;
        if (row.price_min && (from === null || row.price_min < from)) from = row.price_min;
      }
      // Three levels: section, subcategories, leaves.
      const branch = (node) => ({
        id: node.id,
        name: node.name,
        slug: node.category.slug,
        children: node.children.map(branch),
      });
      const children = item.children.map(branch);
      return {
        id: item.id,
        name: item.name,
        href: `/kategorie/${item.category.slug}`,
        count,
        from,
        children,
      };
    })
    .filter((s) => s.count > 0);

  return { total, sections };
}

export async function load({ depends, parent }) {
  depends('website:layout');

  const { menus, categoriesTree } = await parent();
  const [{ data: layout }, summary] = await Promise.all([
    api.items('fragments').readOne(12),
    catalogueSummary(menus.side, categoriesTree),
  ]);

  return { layout, summary };
}
