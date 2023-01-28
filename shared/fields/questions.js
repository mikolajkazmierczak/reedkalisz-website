export const search = [
  'id',
  'user_created',
  'date_created',
  'user_updated',
  'date_updated',
  'from_contact',
  'from_product',
  'spam_chance',
  'name',
  'phone',
  'email',
  'content',
  'file'
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
  from_website: false,
  spam_chance: 0,
  name: '',
  phone: '',
  email: '',
  content: '',
  file: null
});

export default { search, show, read, edit, defaults };
