import { error } from '@sveltejs/kit';

import api from '$/api';
import { parseSearchToParams } from '$/searchparams';
import { makeTree, treeGetAllChildrenIDs } from '%/utils';
import { fields, enabledFilter, countProducts } from '#/products/fields';

/** Only what Directus can sort on directly; nothing is sorted in the app. */
const SORTS = {
  price: ['price_min'],
  'price-desc': ['-price_min'],
  name: ['name'],
  newest: ['-date_created'],
};

function getFilter(query, category, categoriesTree) {
  if (query) {
    return { ...enabledFilter, _or: [{ name: { _contains: query } }, { code: { _contains: query } }] };
  }
  if (category) {
    const ids = [category.id, ...treeGetAllChildrenIDs(categoriesTree, category.id)];
    return { ...enabledFilter, categories: { category: { _in: ids } } };
  }
  return { ...enabledFilter };
}

export async function load({ url, params, parent }) {
  // Server-side, so the browser doesn't fetch the page again on hydration.
  const { categoriesItems } = await parent();
  const categoriesTree = makeTree(categoriesItems.filter((c) => c.enabled));

  const { l, p, q } = parseSearchToParams(url.search);
  const sortKey = SORTS[url.searchParams.get('s')] ? url.searchParams.get('s') : 'price';

  // `enabled` so it 404s for admins too
  const category = categoriesItems.find((c) => c.slug === params.slug && c.enabled);
  if (params.slug !== '_' && !category) throw error(404, '404');

  const filter = getFilter(q, category, categoriesTree);
  const limit = l || 25;
  const page = p || 1;

  const [{ data }, count] = await Promise.all([
    api.items('products').readByQuery({ filter, sort: SORTS[sortKey], fields, limit, page }),
    countProducts(api, filter),
  ]);
  let products = data;

  // calendars arrive from a fragment as pseudo-tiles
  if (params.slug === 'kalendarze-Bf4TIYjf') {
    const calendars = (await api.items('fragments').readOne(11)).data;
    products = [
      ...calendars.map((c, i) => ({ ...c, id: calendars.length - i - 1, alt: c.title })).filter((p) => p.show),
      ...products,
    ];
  }

  return { products, limit, page, count, sort: sortKey };
}
