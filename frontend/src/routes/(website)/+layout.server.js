import api from '$/api';

const categoriesFields = ['id', 'enabled', 'parent', 'index', 'name', 'slug', 'img', 'description'];
const fragmentsFields = ['id', 'name', 'content', 'data'];

/** Same for everyone, admins included, so it loads here: sent with the page instead of fetched again. */
export async function load() {
  const fragment = (id) => api.items('fragments').readOne(id, { fields: fragmentsFields });
  const [{ data: categoriesItems }, about, office, rights] = await Promise.all([
    api.items('categories').readByQuery({ fields: categoriesFields, limit: -1 }),
    fragment(2),
    fragment(4),
    fragment(3),
  ]);
  return { categoriesItems, footerFragments: { about, office, rights } };
}
