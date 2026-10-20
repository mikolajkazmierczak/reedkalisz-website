import heimdall from '$/heimdall';
import { startCalculation } from '@/logs';
import { collectRecalculated, recalculateProductsGenerator as recalculate } from '%/calculations';
import { companies, globalMargins, globals, labelings, priceViews } from '@/globals';
import { get } from 'svelte/store';

/**
 * Uses `recalculateProductsGenerator()` from the shared folder to update all products that match the filter.
 * Written as heimdall's (heimdall.api) and logged in calculations_logs: `trigger` says what started it (see logs.js);
 * a `log` given instead is added to and finished by its caller - one recalculation done in parts (a scan's) is one row.
 */
export async function* recalculateProductsGenerator(
  filter,
  { newPriceView = null, swapLabelings = null, emit = true, trigger = 'other', log = null } = {},
) {
  const entry = log ?? (await startCalculation(trigger, { filter, newPriceView, swapLabelings }));
  try {
    // every price needs all four, whichever page asks (a Kalkulacje tab reads only its own)
    await Promise.all([globalMargins, priceViews, labelings, companies].map((store) => globals.update(store)));
    const stores = {
      globalMargins: get(globalMargins),
      priceViews: get(priceViews),
      labelings: get(labelings),
      companies: get(companies),
    };

    for await (const results of recalculate(heimdall.api, filter, stores, { newPriceView, swapLabelings })) {
      entry.add(results);
      // (the ones whose prices came out the same weren't written: nothing to reload)
      if (emit && results.changed.length) heimdall.emit('products', results.changed);
      yield results;
    }
  } catch (e) {
    if (!log) await entry.fail(e);
    throw e;
  }
  if (!log) await entry.finish('done');
}

/** Collects `recalculateProductsGenerator()` above into one result. */
export const recalculateProducts = (filter, options) =>
  collectRecalculated(recalculateProductsGenerator(filter, options));
