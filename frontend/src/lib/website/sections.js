import { treeGetAllChildrenIDs } from '%/utils';
import { enabledFilter } from '#/products/fields';

// NOWOŚCI, BESTSELLERY and PROMOCJE aren't categories: they are made from the product flags and come before the
// categories. Each gets, as its subcategories, the part of the category tree its products are in, so a visitor can
// see all of them, or only the ones in, say, Długopisy - without anyone having to sort them in by hand.
// They live in the category list as items of their own ({ section, category }), so the menu, the category page,
// its breadcrumbs and the sliders take them like any other category.
// `id` is also the product flag a section is made from.
export const SECTIONS = [
  { id: 'new', name: 'NOWOŚCI', slug: 'nowosci' },
  { id: 'bestseller', name: 'BESTSELLERY', slug: 'bestsellery' },
  { id: 'sale', name: 'PROMOCJE', slug: 'promocje' },
];

// the categories they used to be, for old links (and hidden while they still exist)
export const LEGACY_SLUGS = {
  'nowosci-2026-hZs_K3a5': 'nowosci',
  'bestsellery-_26zWCFh': 'bestsellery',
  'promocje-AxuA4fDb': 'promocje',
};

// what the layout reads to build them
export const flaggedFilter = { ...enabledFilter, _or: SECTIONS.map(({ id }) => ({ [id]: { _eq: true } })) };
export const flaggedFields = [...SECTIONS.map(({ id }) => id), 'categories.category'];

/** The categories with the sections put in front, each with a copy of the tree of its products' categories. */
export function withSections(categoriesItems, flaggedProducts) {
  // the old categories and everything under them go
  const legacy = new Set(categoriesItems.filter((c) => LEGACY_SLUGS[c.slug]).map((c) => c.id));
  const byId = new Map(categoriesItems.map((c) => [c.id, c]));
  const underLegacy = (c) => {
    for (let p = c; p; p = byId.get(p.parent)) if (legacy.has(p.id)) return true;
    return false;
  };
  const items = categoriesItems.filter((c) => !underLegacy(c));
  const enabled = new Map(items.filter((c) => c.enabled).map((c) => [c.id, c]));

  const sections = [];
  SECTIONS.forEach((section, i) => {
    const products = flaggedProducts.filter((p) => p[section.id]);
    if (!products.length) return;
    // the categories the section's products are in, and every category above them
    const ids = new Set();
    for (const { categories } of products) {
      for (const { category } of categories ?? []) {
        for (let c = enabled.get(category); c && !ids.has(c.id); c = enabled.get(c.parent)) ids.add(c.id);
      }
    }
    const id = (category) => `${section.id}:${category}`;
    sections.push({
      id: section.id,
      parent: null,
      index: i - SECTIONS.length, // before the categories
      name: section.name,
      slug: section.slug,
      enabled: true,
      description: null,
      section: section.id,
      category: null,
    });
    for (const categoryId of ids) {
      const c = enabled.get(categoryId);
      sections.push({
        ...c,
        id: id(c.id),
        parent: ids.has(c.parent) ? id(c.parent) : section.id,
        slug: `${section.slug}-${c.slug}`,
        description: null,
        section: section.id,
        category: c.id,
      });
    }
  });
  return [...sections, ...items];
}

/** The filter of enabled products in a category (or a section) and everything under it. */
export function categoryFilter(category, categoriesTree) {
  const real = category.section ? category.category : category.id;
  // as a CSV: Directus reads a url list of more than 20 items as an object, which matches nothing
  const inCategory = real != null && {
    categories: { category: { _in: [real, ...treeGetAllChildrenIDs(categoriesTree, real)].join(',') } },
  };
  const flag = category.section && { [category.section]: { _eq: true } };
  return { ...enabledFilter, ...flag, ...inCategory };
}
