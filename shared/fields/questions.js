export const search = [
  'id',
  'user_created',
  'date_created',
  'user_updated',
  'date_updated',
  'product',
  'read',
  'name',
  'phone',
  'email',
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
  product: null, // asked about on its page; none: from the Kontakt page, or written here
  read: true, // written in the panel: nothing new to read
  name: '',
  phone: '',
  email: '',
  content: '',
});

export default { search, show, read, edit, defaults };
