// The product details the scanner keeps up to date.
// A value the api doesn't have (an unparsable size, no materials) never erases ours.
// The name is only updated while it is still the api's previous one: admins rename products ("SANLIGHT" ->
// "Latarka SANLIGHT"), and a renamed one stays.

const number = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
const list = (v) => (Array.isArray(v) ? v.map((m) => String(m ?? '').trim()).filter(Boolean) : []);
const trim = (v) => (typeof v === 'string' ? v.trim() : '');
const sameItems = (a, b) => a.length === b.length && [...a].sort().join('\n') === [...b].sort().join('\n');

export const detailsFields = ['name', 'description', 'size_x', 'size_y', 'size_z', 'materials'];

export function planDetails(product, apiItem, previousApiItem = null) {
  // -> { field: new value } for the details that changed
  // `previousApiItem` is the product in the scan before this one (the snapshot being replaced)
  const data = {};

  const name = trim(apiItem.name);
  const untouched = !trim(product.name) || (previousApiItem && trim(product.name) === trim(previousApiItem.name));
  if (name && name !== trim(product.name) && untouched) data.name = name;

  const description = trim(apiItem.description);
  if (description && description !== trim(product.description)) data.description = description;

  for (const field of ['size_x', 'size_y', 'size_z']) {
    const size = number(apiItem[field]);
    if (size !== null && !Number.isNaN(size) && size !== number(product[field])) data[field] = size;
  }

  // the same materials in another order are no change
  const materials = list(apiItem.materials);
  if (materials.length && !sameItems(materials, list(product.materials))) data.materials = materials;

  return data;
}
