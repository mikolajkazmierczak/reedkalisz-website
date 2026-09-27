export const search = [
  'id',
  'user_created',
  'date_created',
  'user_updated',
  'date_updated',
  'parent',
  'index',
  'enabled',
  'name',
  'slug',
  'description',
  'img',
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
  parent: null,
  index: null,
  name: '',
  slug: '',
  description: '',
  img: null,
});

export default { search, show, read, edit, defaults };
