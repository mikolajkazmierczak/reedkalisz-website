import api from '$/api';
import { cached, SERVER_MAX_AGE } from '$lib/server/cache';
import { flaggedFields, flaggedFilter, withSections } from '#/sections';

const categoriesFields = ['id', 'enabled', 'parent', 'index', 'name', 'slug', 'description'];
const fragmentsFields = ['id', 'name', 'content', 'data'];

/** Same for everyone, admins included, so it loads here: sent with the page instead of fetched again. */
export function load() {
  // every in-site navigation reruns it (pages read it through parent()), so it's kept for a moment
  return cached('layout', SERVER_MAX_AGE, fetchLayout);
}

async function fetchLayout() {
  const fragment = (id) => api.items('fragments').readOne(id, { fields: fragmentsFields });
  const [{ data: categories }, { data: flagged }, about, office, rights] = await Promise.all([
    api.items('categories').readByQuery({ fields: categoriesFields, limit: -1 }),
    // for NOWOŚCI, BESTSELLERY and PROMOCJE: which categories their products are in
    api.items('products').readByQuery({ filter: flaggedFilter, fields: flaggedFields, limit: -1 }),
    fragment(2),
    fragment(4),
    fragment(3),
  ]);
  const categoriesItems = withSections(categories, flagged);
  return { categoriesItems, footerFragments: { about, office, rights } };
}
