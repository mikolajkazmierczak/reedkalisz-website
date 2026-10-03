import { cleanupPrices, getMinMaxPrices, repairPrices } from './calculationsPrices';
import { calculate as productFields } from './fields/products';
import { deep, reuseIDs } from './utils';

// TODO: this whole file should be a class Calculator

/** Convert percentage to fraction (25% -> 1.25; 0% -> 1) */
function fraction(percent) {
  return percent / 100 + 1;
}

/** Round to two decimal places */
function round(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Resursively replace falsy values with 0 in a nested object
 * ```
 * { a: null, b: { c: null }, d: [{ e: null }], f: [] } // in
 * { a: 0,    b: { c: 0    }, d: [{ e: 0    }], f: [] } // out
 * ```
 */
function sanitize(data) {
  if (typeof data == 'object' && data != null) {
    if (Array.isArray(data)) {
      for (let [i, val] of data.entries()) {
        data[i] = sanitize(val);
      }
    } else {
      for (let [key, val] of Object.entries(data)) {
        data[key] = sanitize(val);
      }
    }
  } else data ||= 0;
  return data;
}

function matchLabelingPriceRange(amount, pricesPerAmount) {
  pricesPerAmount.sort((a, b) => a.amount - b.amount);
  let matchingRange = null;
  for (let range of pricesPerAmount) {
    if (range.amount <= amount) {
      if (range.price) matchingRange = range; // empty prices are ingnored, prices set to 0 are treated as mistakes
    } else break;
  }
  if (matchingRange === null) return { price: 0, isLumpsum: false };
  return { price: matchingRange.price, isLumpsum: matchingRange.amount == 1 };
}

function formula(amount, product, labeling, full, prepress, extra, transport, transportThreshold) {
  amount = sanitize(amount); // number
  product = sanitize(product); // { price: number, margin: number, minimum: number }
  labeling = sanitize(labeling); // { prices: [number], margin: number, minimum: number }
  full = sanitize(full); // { margin: number, minimum: number }
  prepress = sanitize(prepress); // number
  extra = sanitize(extra); // number
  transport = sanitize(transport); // number
  // transportThreshold // number -- not sanitized because 0 means free transport

  const productPrice = amount * product.price;
  const productPriceWithMargin = Math.max(productPrice * fraction(product.margin), productPrice + product.minimum);

  const range = matchLabelingPriceRange(amount, labeling.prices);
  const labelingPrice = (range.isLumpsum ? range.price : amount * range.price) + prepress;
  const labelingPriceWithMargin = Math.max(labelingPrice * fraction(labeling.margin), labelingPrice + labeling.minimum);

  const price = productPriceWithMargin + labelingPriceWithMargin;
  const singlePrice = Math.max(price * fraction(full.margin), price + full.minimum);

  const transportPrice = transportThreshold != null && productPrice > transportThreshold ? 0 : transport;
  const fullPrice = singlePrice + extra + transportPrice;
  return round(fullPrice / amount);
}

function togglePrices(prices, state) {
  prices.forEach((p) => (p.enabled = state));
}

export function toggleCustomPrices(prices, pricesSale, showPrice, sale, someLabelingsEnabled) {
  const disable = (prices) => togglePrices(prices, false);
  const enable = (prices) => togglePrices(prices, true);
  if (!showPrice || someLabelingsEnabled) {
    disable(prices);
    disable(pricesSale);
  } else {
    enable(prices);
    if (sale) enable(pricesSale);
    else disable(pricesSale);
  }
}

function updateCustomPrices(amounts, product, someLabelingsEnabled) {
  const customPricesReusable = {
    prices1: [...product.custom_prices],
    prices2: [...product.custom_prices_sale],
  };
  [product.custom_prices, product.custom_prices_sale] = repairPrices(product.custom_prices, product.custom_prices_sale);
  [product.custom_prices, product.custom_prices_sale] = cleanupPrices(
    amounts,
    product.custom_prices,
    product.custom_prices_sale,
    customPricesReusable,
  );
  toggleCustomPrices(
    product.custom_prices,
    product.custom_prices_sale,
    product.show_price,
    product.sale,
    someLabelingsEnabled,
  );
}

function calculatePrices(amounts, global, labeling, company, product, productLabeling) {
  // amounts: [number]
  // global: global_margin object
  // labeling: labeling object
  // company: company object
  // product: product object
  // productLabeling: product_labeling object
  // returns { prices: [{amount,price}], pricesSale: [{amount,price}] }  <- lengths of prices and pricesSale are equal

  const pricePerAmount = (amount, price) => {
    if (!price) return { amount, price: null };
    return {
      amount,
      price: formula(
        amount,
        {
          price,
          margin: product.global_product_margin ? global.product_margin : product.product_margin,
          minimum: product.global_product_margin ? global.product_minimum : product.product_minimum,
        },
        {
          // TODO: possibility to turn off labeling amounts? would need a different property though
          // prices: labeling.prices.filter(p => p.enabled).map(p => ({ amount: p.amount, price: p.price })),
          prices: labeling.prices.map((p) => ({ amount: p.amount, price: p.price })),
          margin: productLabeling.global_margin ? labeling.margin : productLabeling.margin,
          minimum: productLabeling.global_margin ? labeling.minimum : productLabeling.minimum,
        },
        {
          margin: product.global_full_margin ? global.full_margin : product.full_margin,
          minimum: product.global_full_margin ? global.full_minimum : product.full_minimum,
        },
        labeling.prepress,
        labeling.extra,
        labeling.transport,
        labeling.transport_threshold,
      ),
    };
  };

  const { price, price_sale, price_sale_blacklist, handling_cost } = product;
  const blacklist = price_sale_blacklist ?? [];
  const hc = handling_cost ?? 0; // add handling cost to the unit price
  return {
    prices: amounts.map((amount) => pricePerAmount(amount, price + hc)),
    pricesSale: amounts.map((amount) => pricePerAmount(amount, blacklist.includes(amount) ? null : price_sale + hc)),
  };
}

/**
 * Recalculates labelings prices and pricesSale.
 * Toggles state (enabled) of each pricePerAmount appropriately.
 *
 * `productLabelingsReusable: [{ id: int, pricesIDs: [int], pricesSaleIDs: [int] }, ... }` - reusable prices ids
 */
export function recalculateLabelings(amounts, global, labelings, companies, product, productLabelingsReusable = null) {
  if (!product?.labelings) return;

  let r = 0;
  for (const productLabeling of product.labelings) {
    const labeling = labelings.find((l) => l.id == productLabeling.labeling);
    const company = companies.find((c) => c.id == labeling.company);
    const calculated = calculatePrices(amounts, global, labeling, company, product, productLabeling);

    // enable or disable prices (visibility for a public user)
    const pricesState = productLabeling.enabled && product.show_price;
    const pricesSaleState = productLabeling.enabled && product.show_price && product.sale;
    togglePrices(calculated.prices, pricesState);
    togglePrices(calculated.pricesSale, pricesSaleState);

    // ONLY REALLY RELEVANT FOR THE ADMIN PANEL
    // TODO: This should first try to use price ids from the labeling of the same id (if it exists) and only later
    //       use the rest available for new labelings. It will avoid unncessary moving around of the pricePerAmounts
    //       between labelings. Not a big deal, but it would be nice since unnecesary database shenanigans is the only
    //       reason why this whole "reusable system" even exists in the first place.
    if (productLabelingsReusable) {
      const reusable = productLabelingsReusable[r++];
      if (reusable) {
        // reuse pricePerAmount IDs to avoid the db removing old items and creating new ones
        reuseIDs(calculated.prices, reusable.pricesIDs);
        reuseIDs(calculated.pricesSale, reusable.pricesSaleIDs);
      }
    }

    // update prices
    productLabeling.prices = calculated.prices;
    productLabeling.prices_sale = calculated.pricesSale;
  }

  // update indexes
  product.labelings.forEach((l, i) => (l.index = i));
}

// what a recalculation writes into a pricePerAmount, and a product labeling's lists of them
const priceFields = ['amount', 'price', 'enabled'];
const priceLists = { prices: priceFields, prices_sale: priceFields };

/**
 * Gives `prices` (in their order) the ids of the `saved` rows of the same amounts, so an unchanged price isn't rewritten
 * and a dropped amount is just deleted. The ids must still rise along `prices` (a list reads back by id, and the site
 * pairs a price with its sale price by position): a price whose amount has no row ahead takes the next one (rewritten)
 * or, past the last, a new one; the rows left over are deleted.
 */
function matchIDs(prices, saved) {
  const rows = [...(saved ?? [])].sort((a, b) => a.id - b.id);
  let next = 0;
  for (const price of prices) {
    const same = rows.findIndex((row, i) => i >= next && row.amount === price.amount);
    const at = same === -1 ? next : same;
    if (at < rows.length) price.id = rows[at].id;
    else delete price.id;
    next = at + 1;
  }
}

/**
 * One o2m list as Directus' `{ create, update, delete }`, turning the `saved` rows into `rows` (matched by id) with only
 * what differs: an unchanged row isn't sent, a changed one with all its `fields` (and its own o2m `lists`, the same
 * way), a missing one is deleted, one without an id created. -> null when nothing differs
 */
function listChanges(saved, rows, fields, lists = {}) {
  const left = new Map((saved ?? []).map((row) => [row.id, row]));
  const create = [];
  const update = [];
  for (const row of rows) {
    const was = left.get(row.id);
    left.delete(row.id);
    // whole, not just the field that differs: a row saved in the editor meanwhile can't end up half this one
    const differs = !was || fields.some((f) => was[f] !== row[f]);
    const changed = differs ? Object.fromEntries(fields.map((f) => [f, row[f]])) : {};
    if (!was) {
      create.push(changed);
      continue;
    }
    for (const [list, listFields] of Object.entries(lists)) {
      const changes = listChanges(was[list], row[list], listFields);
      if (changes) changed[list] = changes;
    }
    if (Object.keys(changed).length) update.push({ id: row.id, ...changed });
  }
  const remove = [...left.keys()];
  if (!create.length && !update.length && !remove.length) return null;
  return {
    ...(create.length && { create }),
    ...(update.length && { update }),
    ...(remove.length && { delete: remove }),
  };
}

/** What saving a recalculated `product` changes in it as it was read (`saved`), as a PATCH. -> null when nothing */
function recalculationChanges(saved, product) {
  const updates = {};
  // (price_view: a new one is set by recalculateProductsGenerator())
  for (const field of ['price_view', 'price_min', 'price_max', 'price_min_sale', 'price_max_sale']) {
    if (saved[field] !== product[field]) updates[field] = product[field];
  }
  const lists = {
    custom_prices: listChanges(saved.custom_prices, product.custom_prices, priceFields),
    custom_prices_sale: listChanges(saved.custom_prices_sale, product.custom_prices_sale, priceFields),
    labelings: listChanges(saved.labelings, product.labelings, ['index', 'labeling'], priceLists),
  };
  for (const [list, changes] of Object.entries(lists)) if (changes) updates[list] = changes;
  return Object.keys(updates).length ? updates : null;
}

/**
 * Swaps and/or deletes labelings (updates indexes).
 * Recalculates customPrices, customPricesSale and each labelings prices and pricesSale.
 * Toggles state (enabled) of each pricePerAmount appropriately.
 * Updates the product in the database, only with what differs from `saved` (the product as read, before any change).
 * -> whether it was written
 *
 * swapLabelings: { oldID => newID, ... }  <-- newID can be null to remove the labeling
 */
async function recalculateProduct(
  api,
  amounts,
  global,
  labelings,
  companies,
  product,
  saved,
  { swapLabelings = null } = {},
) {
  if (swapLabelings) {
    for (const [oldID, newID] of swapLabelings) {
      // all of them: a product can have the same labeling more than once (in other places)
      if (newID === null) {
        product.labelings = product.labelings.filter((l) => l.labeling !== oldID);
      } else {
        for (const l of product.labelings) if (l.labeling === oldID) l.labeling = newID;
      }
    }
  }
  // indexes are not updated here - see recalculateLabelings()

  recalculateLabelings(amounts, global, labelings, companies, product);
  const someLabelingsEnabled = product?.labelings.some((l) => l.enabled);
  updateCustomPrices(amounts, product, someLabelingsEnabled);

  // every price into a row it had (each labeling's own, a swapped one's too), so mostly just what moved is written
  const savedLabelings = new Map(saved.labelings.map((l) => [l.id, l]));
  for (const l of product.labelings) {
    matchIDs(l.prices, savedLabelings.get(l.id)?.prices);
    matchIDs(l.prices_sale, savedLabelings.get(l.id)?.prices_sale);
  }
  matchIDs(product.custom_prices, saved.custom_prices); // (instead of the ids cleanupPrices gave them by position)
  matchIDs(product.custom_prices_sale, saved.custom_prices_sale);

  const { min, max, minSale, maxSale } = getMinMaxPrices(product);
  Object.assign(product, { price_min: min, price_max: max, price_min_sale: minSale, price_max_sale: maxSale });

  const updates = recalculationChanges(saved, product);
  if (updates) await api.items('products').updateOne(product.id, updates, { fields: ['id'] }); // (not read back)
  return !!updates;
}

/**
 * Uses `recalculateProduct()` to update all products that match the filter.
 * A new priceView can be set, and labelings can be swapped or deleted.
 * Every product is worked out in memory and compared with what's saved: only the ones that differ are written.
 * Yields each batch's `ids` (all recalculated, for progress) and `changed` (the ones written).
 *
 * `{ swapLabelings: { oldId: newId, ... } }` - newId can be null to remove the labeling
 */
export async function* recalculateProductsGenerator(
  api,
  filter,
  globals,
  { newPriceView = null, swapLabelings = null } = {},
) {
  console.log('Fetching files to recalculate... Filter: ', filter);
  // just the ids: each batch is read right before it's written, so it's compared with a fresh read (a product saved in
  // the editor meanwhile is recalculated as saved)
  const ids = (await api.items('products').readByQuery({ fields: ['id'], filter, limit: -1 })).data.map((p) => p.id);

  // recalculate all products in batches to avoid Directus rate limiting
  console.log(ids.length ? `Recalculating ${ids.length} products...` : 'Nothing to recalculate', filter);

  const batchSize = 20;
  let recalculated = 0;
  let written = 0;
  for (let start = 0; start < ids.length; start += batchSize) {
    const batch = ids.slice(start, start + batchSize);
    // (the ids as one "1,2,3", as the API page sends them; one deleted since is just missing)
    const query = { fields: productFields, filter: { id: { _in: batch.join(',') } }, limit: -1 };
    const products = (await api.items('products').readByQuery(query)).data;
    const changed = await Promise.all(
      products.map((product) => {
        const saved = deep.copy(product); // (what's compared with: the recalculation changes `product` itself)
        if (newPriceView != null) product.price_view = newPriceView;
        const priceView = globals.priceViews.find((pv) => pv.id == product.price_view);
        return recalculateProduct(
          api,
          priceView.amounts,
          globals.globalMargins,
          globals.labelings,
          globals.companies,
          product,
          saved,
          { swapLabelings },
        );
      }),
    );
    recalculated += products.length;
    written += changed.filter(Boolean).length;
    yield {
      products,
      ids: products.map((p) => p.id),
      changed: products.filter((_, j) => changed[j]).map((p) => p.id),
      index: start + batch.length - 1,
    };
  }
  if (ids.length) console.log(`Recalculated ${recalculated} products, ${written} changed`);
}

/** Drains a `recalculateProductsGenerator()`, merging its batches into a single result. */
export async function collectRecalculated(generator) {
  const results = await Array.fromAsync(generator);
  return {
    products: results.flatMap((r) => r.products),
    ids: results.flatMap((r) => r.ids),
    changed: results.flatMap((r) => r.changed),
    index: results.at(-1)?.index,
  };
}

/** Uses `recalculateProducts()` from shared folder to update all products that match the filter. */
export const recalculateProducts = (api, filter, globals, { newPriceView = null, swapLabelings = null } = {}) =>
  collectRecalculated(recalculateProductsGenerator(api, filter, globals, { newPriceView, swapLabelings }));
