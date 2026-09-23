import api from '$/api';
import { makeTree, treeRefreshMetaAndParent } from '%/utils';

const categoriesFields = ['id', 'enabled', 'parent', 'index', 'name', 'slug', 'img', 'description'];
const fragmentsFields = ['id', 'name', 'content', 'data'];

/** The side menu is the enabled category tree; ids are category ids, so they're stable. */
function sideMenuFromCategories(categoriesTree) {
  const convert = ({ id, slug, name, children }) => ({
    id,
    name,
    category: { id, slug, name },
    children: (children ?? []).map(convert),
  });
  const items = categoriesTree.map(convert);
  treeRefreshMetaAndParent(items);
  return items;
}

export async function load() {
  const fragment = (id) => api.items('fragments').readOne(id, { fields: fragmentsFields });
  const [{ data: categoriesItems }, about, office, rights] = await Promise.all([
    api.items('categories').readByQuery({ fields: categoriesFields, limit: -1 }),
    fragment(2),
    fragment(4),
    fragment(3),
  ]);

  const categoriesTree = makeTree(categoriesItems.filter((item) => item.enabled));
  const menus = { side: sideMenuFromCategories(categoriesTree) };

  return { categoriesTree, categoriesItems, menus, footerFragments: { about, office, rights } };
}
