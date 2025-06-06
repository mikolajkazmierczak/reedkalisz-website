export const search = ['id', 'user_created', 'date_created', 'user_updated', 'date_updated', 'name', 'content', 'data'];
export const show = [...search];

export const read = [...search];
export const edit = [...search, 'description'];

export const defaults = () => ({
  id: '+',
  user_created: null,
  date_created: null,
  user_updated: null,
  date_updated: null,
  name: '',
  description: '',
  content: '',
  data: null
});

export default { search, show, read, edit, defaults };
