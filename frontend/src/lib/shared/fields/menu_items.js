export const search = [
  'id',
  'user_created',
  'date_created',
  'user_updated',
  'date_updated',
  'enabled',
  'menu',
  'folder',
  'parent',
  'index',
  'name',
  'url',
  'page',
  'page.id',
  'page.name',
  'product',
  'product.id',
  'product.name',
  'category',
  'category.id',
  'category.name',
  'img'
];
export const show = [...search];

export const read = [...search];
export const edit = [...search];

export const defaults = () => ({
  id: '+',
  user_created: null,
  date_created: null,
  user_updated: null,
  date_updated: null,
  enabled: true,
  menu: null,
  folder: false,
  parent: null,
  index: null,
  name: '',
  url: '',
  page: null,
  product: null,
  category: null,
  img: null
});

export default { search, show, read, edit, defaults };
