import { get } from 'svelte/store';
import api from '$lib/api';
import socket from '$lib/admin/heimdall';
import { reuseIDs } from '$lib/utils';
import { repairPrices, cleanupPrices } from '$lib/admin/calculationsPrices';
import { calculate as productFields } from '$lib/fields/products';
import { globalMargins, priceViews, labelings } from '$lib/admin/global';

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

function getRangePrice(amount, pricesPerAmount) {
  pricesPerAmount.sort((a, b) => a.amount - b.amount);
  let price = 0;
  for (let range of pricesPerAmount) {
    if (range.amount <= amount) price = range.price;
    else if (range.amount > amount) return price;
  }
  return price;
}

function formula(amount, product, labeling, full, prepress, extra, transport, transportThreshold) {
  amount = sanitize(amount); // number
  product = sanitize(product); // { price: number, margin: number, minimum: number }
  labeling = sanitize(labeling); // { prices: [number], margin: number, minimum: number }
  full = sanitize(full); // { margin: number, minimum: number }
  prepress = sanitize(prepress); // number
  extra = sanitize(extra); // number
  transport = sanitize(transport); // number
  transportThreshold = sanitize(transportThreshold); // number

  const productPrice = amount * product.price;
  const productPriceWithMargin = Math.max(productPrice * fraction(product.margin), productPrice + product.minimum);

  const rangePrice = getRangePrice(amount, labeling.prices);
  const labelingPrice = amount * rangePrice + prepress;
  const labelingPriceWithMargin = Math.max(labelingPrice * fraction(labeling.margin), labelingPrice + labeling.minimum);

  const price = productPriceWithMargin + labelingPriceWithMargin;
  const singlePrice = Math.max(price * fraction(full.margin), price + full.minimum);

  const transportPrice = transportThreshold < product.price * amount ? transport : 0; // TODO: this should be revisited
  const fullPrice = singlePrice + extra + transportPrice;
  return round(fullPrice / amount);
}

function togglePrices(prices, state) {
  prices.forEach(p => (p.enabled = state));
}
export async function toggleCustomPrices(prices, pricesSale, showPrice, sale, someLabelingsEnabled) {
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

async function updateCustomPrices(amounts, product, someLabelingsEnabled) {
  [product.prices, product.prices_sale] = repairPrices(product.prices, product.prices_sale);
  [product.prices, product.prices_sale] = cleanupPrices(amounts, product.prices, product.prices_sale);
  toggleCustomPrices(prices, pricesSale, product.show_price, product.sale, someLabelingsEnabled);
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
          prices: labeling.prices.filter(p => p.enabled).map(p => ({ amount: p.amount, price: p.price })),
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
    // TODO: use the rest available for new labelings. It will avoid unncessary moving around of the pricePerAmounts
    // TODO: between labelings. Not a big deal, but it would be nice since unnecesary database shenanigans is the only
    // TODO: reason why this whole "reusable system" even exists in the first place.
    const reusable = productLabelingsReusable[r++];
    console.log(reusable);
    if (reusable) {
      // reuse pricePerAmount IDs to avoid the db removing old items and creating new ones
      reuseIDs(calculated.prices, reusable.pricesIDs);
      reuseIDs(calculated.pricesSale, reusable.pricesSaleIDs);
    }

    // update prices
    productLabeling.prices = calculated.prices;
    productLabeling.prices_sale = calculated.pricesSale;
  }

  // update indexes
  product.labelings.forEach((l, i) => (l.index = i));

  return product.labelings;
}

async function recalculateProduct(amounts, global, labelings, product, swapLabelings = {}) {
  // Swaps and/or deletes labelings (updates indexes).
  // Recalculates customPrices, customPricesSale and each labelings prices and pricesSale.
  //   Toggles state (enabled) of each pricePerAmount appropriately.
  // Updates the product in the database.
  //
  // swapLabelings: { oldID: newID, ... }  <-- newID can be null to remove the labeling

  for (const [oldID, newID] of swapLabelings.entries()) {
    const i = product.labelings.findIndex(l => l.labeling === oldID);
    if (newID === null) {
      product.labelings.splice(i, 1);
    } else {
      product.labelings[i].labeling = newID;
    }
  }
  // indexes are not updated here, they are updated in recalculateLabelings()

  recalculateLabelings(amounts, global, labelings, product);
  const someLabelingsEnabled = product.labelings.some(l => l.enabled);
  updateCustomPrices(amounts, product, someLabelingsEnabled);

  const updates = {
    price_view: product.price_view, // already updated in recalculateProducts()
    prices: product.prices,
    prices_sale: product.prices_sale,
    labelings: product.labelings.map(({ id, index, labeling, prices, prices_sale }) => {
      return { id, index, labeling, prices, prices_sale };
    })
  };
  await api.items('products').updateOne(product.id, updates);
}

export async function recalculateProducts(filter, options = { newPriceView: null, swapLabelings: {} }) {
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
  console.log(products);

  // recalculate each product concurrently
  await Promise.all(
    products.map(product => {
      if (options.newPriceView !== null) product.price_view = options.newPriceView;
      const priceView = stores.priceViews.find(pv => pv.id == product.price_view);
      return recalculateProduct(
        priceView.amounts,
        stores.globalMargins,
        stores.labelings,
        product,
        options.swapLabelings
      );
    })
  );

  const ids = products.map(p => p.id);
  socket.emitChanges('products', ids);

  return {
    products,
    ids: products.map(p => p.id)
  };
}
