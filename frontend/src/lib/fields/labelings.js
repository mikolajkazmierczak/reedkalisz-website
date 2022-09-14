export const read = [
  'id',
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
export const search = [...read];
export const show = [...read];
export const edit = [...read];

export const defaults = () => ({
  id: '+',
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
  prepress: 0,
  transport: 0,
  transport_threshold: 0,
  margin: 0,
  minimum: 0
});

export default { search, show, read, edit, defaults };
