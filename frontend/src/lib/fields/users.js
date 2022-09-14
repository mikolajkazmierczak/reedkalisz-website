export const read = ['id', 'first_name', 'last_name', 'email', 'avatar'];
export const search = [...read];
export const show = [...read];
export const edit = [...read];

export const defaults = () => ({
  id: '+',
  first_name: '',
  last_name: '',
  email: '',
  avatar: null
});

export default { search, show, read, edit, defaults };
