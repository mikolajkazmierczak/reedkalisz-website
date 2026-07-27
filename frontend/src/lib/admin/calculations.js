import api from '$/api';
import heimdall from '$/heimdall';
import { collectRecalculated, recalculateProductsGenerator as recalculate } from '%/calculations';
import { companies, globalMargins, labelings, priceViews } from '@/globals';
import { get } from 'svelte/store';

/** Uses `recalculateProducts()` from shared folder to update all products that match the filter. */
export async function* recalculateProductsGenerator(
  filter,
  { newPriceView = null, swapLabelings = null, emit = true } = {},
) {
  const stores = {
    globalMargins: get(globalMargins),
    priceViews: get(priceViews),
    labelings: get(labelings),
    companies: get(companies),
  };

  for await (const results of recalculate(api, filter, stores, { newPriceView, swapLabelings })) {
    if (emit) heimdall.emit('products', results.ids);
    yield results;
  }
}

/** Uses `recalculateProducts()` from shared folder to update all products that match the filter. */
export const recalculateProducts = (filter, { newPriceView = null, swapLabelings = null, emit = true } = {}) =>
  collectRecalculated(recalculateProductsGenerator(filter, { newPriceView, swapLabelings, emit }));
