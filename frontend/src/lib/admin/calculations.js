import { get } from 'svelte/store';
import api from '$/api';
import heimdall from '$/heimdall';
import { recalculateProducts as recalculate } from '%/calculations';
import { globalMargins, priceViews, labelings } from '@/globals';

export async function recalculateProducts(filter, { newPriceView = null, swapLabelings = null } = {}) {
  // Uses `recalculateProducts()` from shared folder to update all products that match the filter.

  const stores = {
    globalMargins: get(globalMargins),
    priceViews: get(priceViews),
    labelings: get(labelings)
  };

  const results = await recalculate(api, filter, stores, { newPriceView, swapLabelings });

  heimdall.emit('products', results.ids);
  return results;
}
