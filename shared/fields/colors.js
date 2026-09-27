export const search = [
  'id',
  'user_created',
  'date_created',
  'user_updated',
  'date_updated',
  'name',
  'color',
  'multicolor',
  'transparent',
  'company',
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
  name: '',
  color: null, // none yet: the menu asks for one (unless it's multicolour or see-through)
  multicolor: false,
  transparent: false,
});

export default { search, show, read, edit, defaults };
