export const read = [
  'id',
  'user_created',
  'date_created',
  'user_updated',
  'date_updated',
  'enabled',
  'name',
  'slug',
  'seo_title',
  'seo_description',
  'description',
  'img',
  'parent',
  'index'
];
export const search = [...read];
export const show = [...read];
export const edit = [...read];

export const defaults = () => ({
  id: '+',
  user_created: null,
  date_created: null,
  user_updated: null,
  date_updated: null,
  enabled: true,
  index: null,
  name: '',
  slug: '',
  seo_title: '',
  seo_description: '',
  description: '',
  img: null,
  parent: null,
  index: null
});

export default { search, show, read, edit, defaults };
