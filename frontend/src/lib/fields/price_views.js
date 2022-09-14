export const read = ['id', 'name', 'default', 'amounts'];
export const search = [...read];
export const show = [...read];
export const edit = [...read, 'user_created', 'date_created', 'user_updated', 'date_updated'];

export const defaults = () => ({
  id: '+',
  user_created: null,
  date_created: null,
  user_updated: null,
  date_updated: null,
  name: '',
  default: false,
  amounts: []
});

export default { search, show, read, edit, defaults };
