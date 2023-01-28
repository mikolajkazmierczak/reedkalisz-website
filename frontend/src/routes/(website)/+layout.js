import api from '$/api';
import { nanoid } from 'nanoid';
import { makeTree, treeGetItem, treeRefreshMetaAndParent } from '%/utils';
import { menu, categories } from '#/stores';

const menuFields = [
  'id',
  'enabled',
  'folder',
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

const categoriesFields = ['id', 'enabled', 'parent', 'index', 'name', 'slug', 'img'];

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

function embedAllChildren(menuItem, category) {
  // Pass all children of a category as children of menu item.
  for (const categoryChild of category.children) {
    const menuItemChild = convertCategoryToMenuItem(categoryChild);
    embedAllChildren(menuItemChild, categoryChild);
    menuItem.children.push(menuItemChild);
  }
}

function embedCategories(menuTree, categoriesTree) {
  // Embeds categories in the menu.
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

export async function load() {
  const menuFilter = { menu: { _eq: 1 } };
  const menuItems = (await api.items('menu_items').readByQuery({ filter: menuFilter, fields: menuFields })).data;
  const menuTree = makeTree(menuItems.filter(item => item.enabled));

  const categoriesItems = (await api.items('categories').readByQuery({ fields: categoriesFields })).data;
  const categoriesTree = makeTree(categoriesItems.filter(item => item.enabled));

  embedCategories(menuTree, categoriesTree);
  if (someCategoriesEmbeded(menuTree)) {
    treeRefreshMetaAndParent(menuTree);
  }

  menu.set(menuTree);
  categories.set(categoriesTree);
  return { menu: menuTree, categories: categoriesTree };
}
