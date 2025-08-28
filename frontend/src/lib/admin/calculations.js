import { get } from 'svelte/store';
import api from '$/api';
import heimdall from '$/heimdall';
import { recalculateProducts as recalculate } from '%/calculations';
import { globalMargins, priceViews, labelings, companies } from '@/globals';

export async function recalculateProducts(filter, { newPriceView = null, swapLabelings = null, emit = true } = {}) {
  // Uses `recalculateProducts()` from shared folder to update all products that match the filter.

  const stores = {
    globalMargins: get(globalMargins),
    priceViews: get(priceViews),
    labelings: get(labelings),
    companies: get(companies)
  };

  const results = await recalculate(api, filter, stores, { newPriceView, swapLabelings });

  if (emit) heimdall.emit('products', results.ids);
  return results;
}
