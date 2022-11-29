import api from '$/api';
import { makeTree } from '$/utils';
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

export async function load() {
  const menuFilter = { menu: { _eq: 1 } };
  const menuItems = (await api.items('menu_items').readByQuery({ filter: menuFilter, fields: menuFields })).data;
  const menuTree = makeTree(menuItems.filter(item => item.enabled));
  menu.set(menuTree);

  const categoriesItems = (await api.items('categories').readByQuery({ fields: categoriesFields })).data;
  const categoriesTree = makeTree(categoriesItems.filter(item => item.enabled));
  categories.set(categoriesTree);

  return { menu: menuTree, categories: categoriesTree };
}
