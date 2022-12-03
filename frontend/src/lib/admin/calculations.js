import { get } from 'svelte/store';
import api from '$/api';
import heimdall from '$/heimdall';
import { reuseIDs } from '$/utils';
import { repairPrices, cleanupPrices } from '@/calculationsPrices';
import { calculate as productFields } from '$/fields/products';
import { globalMargins, priceViews, labelings } from '@/globals';

function fraction(percent) {
  // convert percentage to fraction
  // e.g. 25% -> 1.25; 0% -> 1
  return percent / 100 + 1;
}

function round(num) {
  // round to two decimal places
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function sanitize(data) {
  // resursively replace falsy values with 0 in a nested object
  // e.g. { a: null, b: { c: null }, d: [{ e: null }], f: [] }
  //      { a: 0,    b: { c: 0    }, d: [{ e: 0    }], f: [] }
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
  prices.forEach(p => (p.enabled = state));
}

export function toggleCustomPrices(prices, pricesSale, showPrice, sale, someLabelingsEnabled) {
  const disable = prices => togglePrices(prices, false);
  const enable = prices => togglePrices(prices, true);
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
    prices2: [...product.custom_prices_sale]
  };
  [product.custom_prices, product.custom_prices_sale] = repairPrices(product.custom_prices, product.custom_prices_sale);
  [product.custom_prices, product.custom_prices_sale] = cleanupPrices(
    amounts,
    product.custom_prices,
    product.custom_prices_sale,
    customPricesReusable
  );
  toggleCustomPrices(
    product.custom_prices,
    product.custom_prices_sale,
    product.show_price,
    product.sale,
    someLabelingsEnabled
  );
}

export function calculatePrices(amounts, global, labeling, product, productLabeling) {
  // amounts: [number]
  // global: global_margin object
  // labeling: labeling object
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
          minimum: product.global_product_margin ? global.product_minimum : product.product_minimum
        },
        {
          // TODO: possibility to turn off labeling amounts? would need a different property though
          // prices: labeling.prices.filter(p => p.enabled).map(p => ({ amount: p.amount, price: p.price })),
          prices: labeling.prices.map(p => ({ amount: p.amount, price: p.price })),
          margin: productLabeling.global_margin ? labeling.margin : productLabeling.margin,
          minimum: productLabeling.global_margin ? labeling.minimum : productLabeling.minimum
        },
        {
          margin: product.global_full_margin ? global.full_margin : product.full_margin,
          minimum: product.global_full_margin ? global.full_minimum : product.full_minimum
        },
        labeling.prepress,
        labeling.extra,
        labeling.transport,
        labeling.transport_threshold
      )
    };
  };

  const { price, price_sale, price_sale_blacklist } = product;
  const blacklist = price_sale_blacklist ?? [];
  return {
    prices: amounts.map(amount => pricePerAmount(amount, price)),
    pricesSale: amounts.map(amount => pricePerAmount(amount, blacklist.includes(amount) ? null : price_sale))
  };
}

export function recalculateLabelings(amounts, global, labelings, product, productLabelingsReusable = null) {
  // Recalculates labelings prices and pricesSale.
  //   Toggles state (enabled) of each pricePerAmount appropriately.
  // `productLabelingsReusable`: [{ id: int, pricesIDs: [int], pricesSaleIDs: [int] }, ... } - reusable prices ids

  let r = 0;
  for (const productLabeling of product.labelings) {
    const labeling = labelings.find(l => l.id == productLabeling.labeling);
    const calculated = calculatePrices(amounts, global, labeling, product, productLabeling);

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

  return product.labelings;
}

async function recalculateProduct(amounts, global, labelings, product, swapLabelings = null) {
  // Swaps and/or deletes labelings (updates indexes).
  // Recalculates customPrices, customPricesSale and each labelings prices and pricesSale.
  //   Toggles state (enabled) of each pricePerAmount appropriately.
  // Updates the product in the database.
  //
  // swapLabelings: { oldID => newID, ... }  <-- newID can be null to remove the labeling

  if (swapLabelings) {
    for (const [oldID, newID] of swapLabelings) {
      const i = product.labelings.findIndex(l => l.labeling === oldID);
      if (newID === null) {
        product.labelings.splice(i, 1);
      } else {
        product.labelings[i].labeling = newID;
      }
    }
  }
  // indexes are not updated here, they are updated in recalculateLabelings()

  recalculateLabelings(amounts, global, labelings, product);
  const someLabelingsEnabled = product.labelings.some(l => l.enabled);
  updateCustomPrices(amounts, product, someLabelingsEnabled);

  const updates = {
    price_view: product.price_view, // already updated in recalculateProducts()
    custom_prices: product.custom_prices,
    custom_prices_sale: product.custom_prices_sale,
    labelings: product.labelings.map(({ id, index, labeling, prices, prices_sale }) => {
      return { id, index, labeling, prices, prices_sale };
    })
  };
  await api.items('products').updateOne(product.id, updates);
}

export async function recalculateProducts(filter, { newPriceView = null, swapLabelings = null } = {}) {
  // Uses `recalculateProduct()` to update all products that match the filter.
  // A new priceView can be set, and labelings can be swapped or deleted.
  //
  // options.swapLabelings: { oldID: newID, ... }  <-- newID can be null to remove the labeling

  const stores = {
    globalMargins: get(globalMargins),
    priceViews: get(priceViews),
    labelings: get(labelings)
  };

  const products = (await api.items('products').readByQuery({ fields: productFields, filter })).data;

  // recalculate each product concurrently
  await Promise.all(
    products.map(product => {
      if (newPriceView != null) product.price_view = newPriceView;
      const priceView = stores.priceViews.find(pv => pv.id == product.price_view);
      return recalculateProduct(priceView.amounts, stores.globalMargins, stores.labelings, product, swapLabelings);
    })
  );

  const ids = products.map(p => p.id);
  heimdall.emit('products', ids);

  return {
    products,
    ids: products.map(p => p.id)
  };
}
