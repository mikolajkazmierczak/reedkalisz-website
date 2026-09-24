import { treeGetAllChildrenIDs } from '%/utils';
import { fields, enabledFilter, countProducts } from './fields';

/** Cards fetched for a slider's first page ahead of time: enough for one row at the widest layout. */
export const SLIDER_PRELOAD = 8;

/** Enabled products in a category and everything under it; null when the category is gone or disabled. */
export function sliderFilter(slug, categoriesItems, categoriesTree, filterIds = []) {
  const category = categoriesItems?.find((c) => c.slug === slug && c.enabled)?.id;
  if (!category) return null;
  const ids = [category, ...treeGetAllChildrenIDs(categoriesTree, category)];
  const filter = { ...enabledFilter, categories: { category: { _in: ids } } };
  return filterIds.length ? { ...filter, id: { _nin: filterIds } } : filter;
}

/** A page of a slider; pass the `count` once known, so paging doesn't recount. */
export async function fetchSlider(api, filter, limit, page = 1, count = null) {
  const [{ data }, total] = await Promise.all([
    api.items('products').readByQuery({ filter, sort: ['price_min'], fields, limit, page }),
    count ?? countProducts(api, filter),
  ]);
  return { products: data, count: total };
}

/** A slider's first page, for the server render (homepage sections, "Podobne produkty"); null when it has none. */
export async function preloadSlider(api, slug, categoriesItems, categoriesTree, filterIds = []) {
  const filter = sliderFilter(slug, categoriesItems, categoriesTree, filterIds);
  return filter ? fetchSlider(api, filter, SLIDER_PRELOAD) : null;
}
