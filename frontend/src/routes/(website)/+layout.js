import api from '$/api';
import { nanoid } from 'nanoid';
import { makeTree, treeGetItem, treeRefreshMetaAndParent } from '%/utils';

const menusFields = [
  'id',
  'enabled',
  'folder',
  'menu',
  'parent',
  'index',
  'name',
  'url',
  'page.id',
  'page.slug',
  'page.name',
  'product.id',
  'product.slug',
  'product.name',
  'category.id',
  'category.slug',
  'category.name',
  'img'
];
const categoriesFields = ['id', 'enabled', 'parent', 'index', 'name', 'slug', 'img', 'description'];
const fragmentsFields = ['id', 'name', 'content', 'data'];

const convertCategoryToMenuItem = category => ({
  id: nanoid(8), // fake menu item id to make sure nothing breaks
  enabled: true,
  folder: false,
  name: category.name,
  url: null,
  page: null,
  product: null,
  category: {
    id: category.id,
    slug: category.slug,
    name: category.name
  },
  _meta: { embeded: true },
  children: []
  // other _meta, parent, index will be asigned later
});

function embedCategories(menuTree, categoriesTree) {
  // Embeds categories in the menu.

  function embedAllChildren(menuItem, category) {
    // Pass all children of a category as children of menu item.
    for (const categoryChild of category.children) {
      const menuItemChild = convertCategoryToMenuItem(categoryChild);
      embedAllChildren(menuItemChild, categoryChild);
      menuItem.children.push(menuItemChild);
    }
  }

  for (let item of menuTree) {
    if (item.category && !item._meta?.embeded) {
      const category = treeGetItem(categoriesTree, item.category.id);
      if (category) embedAllChildren(item, category);
    }
    if (item.children) {
      embedCategories(item.children, categoriesTree);
    }
  }
}

function someCategoriesEmbeded(menuTree) {
  // Checks if there are any categories embeded in the menu.
  for (let item of menuTree) {
    if (item.category && item._meta?.embeded) return true;
    if (item.children && someCategoriesEmbeded(item.children)) return true;
  }
  return false;
}

function makeMenuTree(menuId, menuItems, categoriesTree) {
  // Makes a menu tree from menu items.
  const tree = makeTree(menuItems.filter(m => m.enabled && m.menu == menuId));
  embedCategories(tree, categoriesTree);
  if (someCategoriesEmbeded(tree)) treeRefreshMetaAndParent(tree);
  return tree;
}

export async function load() {
  const categoriesItems = (await api.items('categories').readByQuery({ fields: categoriesFields, limit: -1 })).data;
  const categoriesTree = makeTree(categoriesItems.filter(item => item.enabled));

  const menuItems = (await api.items('menu_items').readByQuery({ fields: menusFields, limit: -1 })).data;
  const menu = id => makeMenuTree(id, menuItems, categoriesTree);
  const menus = { top: menu(1), side: menu(2), footer: menu(3) };

  const fragment = async id => await api.items('fragments').readOne(id, { fields: fragmentsFields });
  const footerFragments = { about: await fragment(2), office: await fragment(4), rights: await fragment(3) };

  return { categoriesTree, categoriesItems, menus, footerFragments };
}
