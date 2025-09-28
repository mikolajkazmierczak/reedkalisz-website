import { error } from '@sveltejs/kit';
import { writable, get } from 'svelte/store';

import api from '$/api';
import { parseSearchToParams } from '$/searchparams';
import { treeGetAllChildrenIDs } from '%/utils';
import { fields } from '#/products/fields';

const countStore = writable();
const filterStore = writable();

async function getFilter(query, category, categoriesTree) {
  // by search query
  if (query) {
    return { _or: [{ name: { _contains: query } }, { code: { _contains: query } }] };
  }
  // by category
  if (category) {
    const getIDs = c => [c, ...treeGetAllChildrenIDs(categoriesTree, c)];
    return { categories: { category: { _in: getIDs(category.id) } } };
  }
  // all products
  return {};
}

export async function load({ url, parent, params }) {
  const { categoriesTree, categoriesItems, menus } = await parent();

  const { l, p, q } = parseSearchToParams(url.search);

  const category = categoriesItems.find(c => c.slug === params.slug);
  if (params.slug !== '_' && !category) throw error(404, '404');

  const filter = await getFilter(q, category, categoriesTree);
  const sort = ['price_min'];
  const limit = l || 25;
  const page = p || 1;

  let products = (await api.items('products').readByQuery({ filter, sort, fields, limit, page, meta: '*' })).data;

  // a tragic way to count products without running too many requests
  // to workaround meta.filter_count consistently returning the wrong values
  let count = get(countStore);
  const oldFilter = get(filterStore);
  if (oldFilter !== JSON.stringify(filter)) {
    count = (await api.items('products').readByQuery({ filter, fields: ['id'], limit: -1 })).data.length;
    countStore.set(count);
    filterStore.set(JSON.stringify(filter));
  }

  // add calendars from the fragment as tiles
  if (params.slug === 'kalendarze-Bf4TIYjf') {
    const calendars = (await api.items('fragments').readOne(11)).data;
    products = [
      ...calendars.map((c, i) => ({ ...c, id: calendars.length - i - 1, alt: c.title })).filter(p => p.show),
      ...products
    ];
  }

  return { category, menus, products, limit, page, count };
}
