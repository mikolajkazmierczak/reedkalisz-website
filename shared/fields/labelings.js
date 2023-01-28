export const search = [
  'id',
  'index',
  'user_created',
  'date_created',
  'user_updated',
  'date_updated',
  'company',
  'default',
  'name',
  'code',
  'type',
  'prices.id',
  'prices.enabled',
  'prices.amount',
  'prices.price',
  'prepress',
  'transport',
  'transport_threshold',
  'margin',
  'minimum'
];
export const show = [...search];

export const read = [...search];
export const edit = [...search];

export const defaults = () => ({
  id: '+',
  index: null,
  user_created: null,
  date_created: null,
  user_updated: null,
  date_updated: null,
  company: null,
  default: false,
  name: '',
  code: '',
  type: '',
  prices: [],
  prepress: null,
  transport: null,
  transport_threshold: null,
  margin: null,
  minimum: null
});

export default { search, show, read, edit, defaults };
