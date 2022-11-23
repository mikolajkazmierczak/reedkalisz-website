export const search = ['id', 'first_name', 'last_name', 'email', 'avatar'];
export const show = [...search];

export const read = [...search];
export const edit = [...search];

export const defaults = () => ({
  id: '+',
  first_name: '',
  last_name: '',
  email: '',
  avatar: null
});

export default { search, show, read, edit, defaults };
