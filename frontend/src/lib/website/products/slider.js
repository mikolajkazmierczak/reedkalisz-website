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

export async function fetchSlider(api, filter, limit, page = 1) {
  const [{ data }, count] = await Promise.all([
    api.items('products').readByQuery({ filter, sort: ['price_min'], fields, limit, page }),
    countProducts(api, filter),
  ]);
  return { products: data, count };
}
