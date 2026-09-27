export const search = [
  'id',
  'user_created',
  'date_created',
  'user_updated',
  'date_updated',
  'from_contact',
  'from_product',
  'read',
  'spam_chance',
  'name',
  'phone',
  'email',
  'content',
  'file',
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
  from_contact: false,
  from_product: false,
  read: true, // written in the panel: nothing new to read
  spam_chance: 0,
  name: '',
  phone: '',
  email: '',
  content: '',
  file: null,
});

export default { search, show, read, edit, defaults };
