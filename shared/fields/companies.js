export const search = ['id', 'user_created', 'date_created', 'user_updated', 'date_updated', 'name', 'api_checked'];
export const show = [...search];

export const read = [...search];
export const edit = [...search, 'api_snapshot', 'api_snapshot_date'];

export const defaults = () => ({
  id: '+',
  user_created: null,
  date_created: null,
  user_updated: null,
  date_updated: null,
  name: '',
  api_checked: []
});

export default { search, show, read, edit, defaults };
