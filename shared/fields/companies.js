export const search = [
  'id',
  'user_created',
  'date_created',
  'user_updated',
  'date_updated',
  'name',
  'api_snapshot',
  'api_flags',
  'api_last_scan',
  'api_discount',
  'api_handling_costs',
  'api_labelings_mappings',
  'api_categories_mappings',
  'api_places_mappings',
  'api_labelings_codes',
  'api_labelings_targets',
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
  api_snapshot: null, // file
  api_flags: null, // object
  api_last_scan: null, // timestamp
  api_discount: null,
  api_handling_costs: null, // object
  api_labelings_mappings: null, // object
  api_categories_mappings: null, // object
  api_places_mappings: null, // object
  api_labelings_codes: null, // [code] from the last scan
  api_labelings_targets: null, // ["company|code"] the last scan's labelings mappings led to
});

export default { search, show, read, edit, defaults };
