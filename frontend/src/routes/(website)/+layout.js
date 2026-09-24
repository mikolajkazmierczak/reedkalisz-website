import { makeTree, treeRefreshMetaAndParent } from '%/utils';

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

/** Built from the server's list rather than sent: the tree and menu would repeat it twice over. */
export function load({ data }) {
  const categoriesTree = makeTree(data.categoriesItems.filter((item) => item.enabled));
  return { ...data, categoriesTree, menus: { side: sideMenuFromCategories(categoriesTree) } };
}
