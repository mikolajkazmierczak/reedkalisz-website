export const search = [
  'id',
  'user_created',
  'date_created',
  'user_updated',
  'date_updated',
  'enabled',
  'name',
  'slug',
  'content',
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
  name: '',
  slug: '',
  content: '',
});

export default { search, show, read, edit, defaults };
