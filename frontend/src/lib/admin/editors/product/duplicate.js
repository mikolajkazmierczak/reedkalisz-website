import { get } from 'svelte/store';
import api from '$/api';
import heimdall from '$/heimdall';
import { edit as fields } from '%/fields/products';
import { slugify } from '%/utils';
import { recalculateProducts } from '@/calculations';
import { companies } from '@/globals';
import { usedFiles } from '@/files';

// A copy of a product: everything it has (variants, gallery, attachments, labelings, categories, prices), under the
// next free "(n)" of its code and name - "Latarka" becomes "Latarka (2)", a copy of that "Latarka (3)". The copy is
// hidden until an admin shows it, and uses the very same image files (deleting one product keeps what the other uses).
// It is REED's: a supplier's feed doesn't have its code, so the scanner would take it for a retired product.

const own = ['id', 'user_created', 'date_created', 'user_updated', 'date_updated'];

// the rows it has, as new ones: without their ids (and whose they were)
const fresh = (value) => {
  if (Array.isArray(value)) return value.map(fresh);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).flatMap(([k, v]) => (own.includes(k) ? [] : [[k, fresh(v)]])));
};

// "Latarka (2)" -> { base: 'Latarka', n: 2 }
function numbered(text) {
  const [, base, n] = (text ?? '').match(/^(.*?)(?: \((\d+)\))?$/);
  return { base, n: Number(n ?? 1) };
}

// -> the new product's slug
export async function duplicateProduct(id) {
  const product = await api.items('products').readOne(id, { fields });
  const code = numbered(product.code);
  const name = numbered(product.name);

  // the first number after it that no product has taken
  const filter = { code: { _starts_with: code.base } };
  const taken = new Set(
    (await api.items('products').readByQuery({ fields: ['code'], filter, limit: -1 })).data.map((p) => p.code),
  );
  let n = Math.max(code.n, name.n) + 1;
  while (taken.has(`${code.base} (${n})`)) n++;

  const copy = {
    ...fresh(product),
    code: `${code.base} (${n})`,
    name: `${name.base} (${n})`,
    enabled: false,
    company: get(companies).find((c) => c.name === 'REED')?.id ?? product.company,
    images_history: [...usedFiles(product)],
    api_images: null, // the scanner starts tracking it on its own
    handling_cost: null, // REED has none: the editor wouldn't show it, yet it would add to every price
  };
  copy.slug = slugify([copy.code, copy.name], { key: true });

  const { id: newId } = await api.items('products').createOne(copy, { fields: ['id'] });
  await recalculateProducts({ id: { _eq: newId } }, { emit: false });
  heimdall.emit('products', newId);
  return copy.slug;
}
