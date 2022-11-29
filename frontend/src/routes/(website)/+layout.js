import api from '$/api';
import { makeTree, treeGetItem, treeRefreshMetaAndParent } from '$/utils';
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

function convertCategoryToMenuItems(category) {
  // Converts a category and all it's children to a menu item.
  const mapCategoryToItem = category => ({
    id: category.id,
    enabled: category.enabled,
    folder: false,
    name: category.name,
    url: `/kategorie/${category.slug}`
  });
  const item = mapCategoryToItem(category);
  if (category.children.length) {
    item.children = category.children.map(mapCategoryToItem);
  }
}

function embedCategoriesInMenu(menuTree, categoriesTree) {
  // Embeds categories in the menu.
  let embeded = false;
  for (let item of menuTree) {
    if (item.category) {
      embeded = true;
      const category = treeGetItem(categoriesTree, item.category.id);
      if (category) item.category = convertCategoryToMenuItems(category);
    }
    if (item.children) {
      const embededInChildren = embedCategoriesInMenu(item.children, categories);
      embeded = embededInChildren || embeded;
    }
  }
  return embeded;
}

export async function load() {
  const menuFilter = { menu: { _eq: 1 } };
  const menuItems = (await api.items('menu_items').readByQuery({ filter: menuFilter, fields: menuFields })).data;
  const menuTree = makeTree(menuItems.filter(item => item.enabled));

  const categoriesItems = (await api.items('categories').readByQuery({ fields: categoriesFields })).data;
  const categoriesTree = makeTree(categoriesItems.filter(item => item.enabled));

  const wereCategoriesEmbeded = embedCategoriesInMenu(menuTree, categoriesTree);
  if (wereCategoriesEmbeded) treeRefreshMetaAndParent(menuTree);

  menu.set(menuTree);
  categories.set(categoriesTree);
  return { menu: menuTree, categories: categoriesTree };
}
