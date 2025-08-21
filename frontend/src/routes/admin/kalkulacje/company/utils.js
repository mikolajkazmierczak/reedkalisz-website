import api from '$/api';
import { read as fields, defaults } from '%/fields/labelings';
import { deep, diffSync, uid } from '%/utils';
import { globals } from '@/globals';
import { recalculateProducts } from '@/calculations';

const fieldsToIgnore = ['user_created', 'date_created', 'user_updated', 'date_updated'];

function getAmounts(items) {
  // based on the first item
  return items.length ? items[0].prices.map(p => p.amount) : [];
}

export function createNewLabeling(company, items) {
  const item = defaults();
  delete item.id;
  item._new = true;
  item._uid = uid(10);
  item.index = items.length;
  item.company = company.id;
  if (items.length === 0) {
    item.default = true;
  }
  const amounts = getAmounts(items);
  if (amounts.length === 0) {
    item.prices.push({ amount: 1, price: null }); // TODO: lumpsum is mandatory, why?
  } else {
    for (const amount of amounts) {
      item.prices.push({ amount, price: null, _uid: uid(10) });
    }
  }
  return item;
}

export function getChanged(items, itemsOriginal) {
  return items.filter(item => {
    const original = itemsOriginal.find(o => o._uid == item._uid);
    if (!original) return true;
    const { changed } = diffSync(item, original, { fieldsToIgnore });
    if (changed) return true;
  });
}

export function reindex(items) {
  // Reassigns indexes from scratch, making sure they are sequential and start from 0.
  // Removed items get indexes set to -1.
  let i = 0;
  for (const item of items) {
    item.index = item._remove ? -1 : i++;
  }
  return items.sort((a, b) => a.index - b.index);
}

function tryRemoveEmptyAmounts(items) {
  // Check if there are empty amounts, ask the user if he wants to continue, remove empty ones.
  if (items.some(item => item.prices.some(p => !p.amount))) {
    const prompt = `Nie zdefiniowano nakładów w niektórych kolumnach. Jeśli kontynuujesz, zostaną usunięte!`;
    if (!confirm(prompt)) return false;
    for (const item of items) {
      item.prices = item.prices.filter(p => p.amount);
    }
  }
  return true;
}

function tryRemoveDuplicateAmounts(items) {
  // Check if there are duplicate amounts, ask the user if he wants to continue, only keep the first occurences.
  const amounts = [];
  const duplicates = [];
  const firstIndexes = [];
  for (const [i, a] of getAmounts(items).entries()) {
    if (amounts.includes(a)) {
      duplicates.push(a);
    } else {
      amounts.push(a);
      firstIndexes.push(i);
    }
  }
  if (duplicates.length) {
    const prompt =
      `Wykryto powtarzające się nakłady: "${duplicates.join(', ')}". ` +
      `Jeśli kontynuujesz zostaną zachowane tylko pierwsze wystąpienia.`;
    if (!confirm(prompt)) return false;
    for (const item of items) {
      item.prices = item.prices.filter((_, i) => firstIndexes.includes(i));
    }
  }
  return true;
}

export function prepareSave(items) {
  return tryRemoveEmptyAmounts(items) && tryRemoveDuplicateAmounts(items);
}

async function saveItem(item) {
  if (item._new) {
    // CREATE
    const created = await api.items('labelings').createOne(item, { fields });
    return { labelings: [created.id], products: [] };
  } else if (item._remove) {
    // DELETE
    // update affected products
    const filter = { labelings: { labeling: { _eq: item.id } } };
    const swapLabelings = new Map([[item.id, item._swap]]); // will delete the labeling if swapID is null
    const { ids } = await recalculateProducts(filter, { swapLabelings });
    // delete the labeling
    await api.items('labelings').deleteOne(item.id);
    return { labelings: [item.id], products: ids };
  } else {
    // UPDATE
    const updated = await api.items('labelings').updateOne(item.id, item, { fields });
    // TODO: check if the item changed prices or amounts, if not, skip recalculation
    // update the labelings global before recalculation
    await globals.update('labelings', { ids: [updated.id] });
    // update affected products
    const filter = { labelings: { labeling: { _eq: updated.id } } };
    const { ids } = await recalculateProducts(filter);
    return { labelings: [updated.id], products: ids };
  }
}

export async function* save(changed) {
  // First existing items are updated, and new ones are created.
  // Then items marked for removal are deleted, and some are swapped (that's why updating and creating is first).
  changed = changed.sort((a, b) => (a._remove ? 1 : b._remove ? -1 : 0)); // remove items last

  for (const item of deep.copy(changed)) {
    // cleanup update data
    for (const field of fieldsToIgnore) {
      delete item[field];
    }

    const ids = await saveItem(item);
    yield { uid: item._uid, ids };
  }
}
