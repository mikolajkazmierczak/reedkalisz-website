import { error, redirect } from '@sveltejs/kit';

import api from '$lib/server/api';
import { parseSearchToParams } from '$/searchparams';
import { makeTree } from '%/utils';
import { fields, enabledFilter, countProducts } from '#/products/fields';
import { categoryFilter, LEGACY_SLUGS } from '#/sections';

/** Only what Directus can sort on directly; nothing is sorted in the app. */
const SORTS = {
  price: ['price_min'],
  'price-desc': ['-price_min'],
  name: ['name'],
  newest: ['-date_created'],
};

function getFilter(query, category, categoriesTree) {
  if (query) {
    // a variant's code too ('R123-10'), as printed on catalogues and offers; `_some` so hidden variants don't match
    // (the public permission isn't applied inside a plain o2m join)
    const inVariants = { storage: { _some: { enabled: { _eq: true }, api_color_code: { _contains: query } } } };
    return { ...enabledFilter, _or: [{ name: { _contains: query } }, { code: { _contains: query } }, inVariants] };
  }
  if (category) return categoryFilter(category, categoriesTree);
  return { ...enabledFilter };
}

export async function load({ url, params, parent }) {
  // NOWOŚCI 2026, BESTSELLERY and PROMOCJE were categories once, now they're made from the product flags
  if (LEGACY_SLUGS[params.slug]) throw redirect(301, `/kategorie/${LEGACY_SLUGS[params.slug]}${url.search}`);

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

  // calendars arrive from a fragment as pseudo-tiles, on the category named so (not on its copies in the sections)
  if (category && !category.section && category.name.trim().toLowerCase() === 'kalendarze') {
    const calendars = (await api.items('fragments').readOne(11)).data;
    products = [
      ...calendars.map((c, i) => ({ ...c, id: calendars.length - i - 1, alt: c.title })).filter((p) => p.show),
      ...products,
    ];
  }

  return { products, limit, page, count, sort: sortKey };
}
