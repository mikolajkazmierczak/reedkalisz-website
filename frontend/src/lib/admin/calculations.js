import { get } from 'svelte/store';
import api from '$lib/api';
import socket from '$lib/admin/heimdall';
import { reuseIDs } from '$lib/utils';
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

export function calculateLabelings(amounts, global, labelings, productLabelings) {
  for (const [i, productLabeling] of Object.entries(productLabelings)) {
    const data = calculatePrices(
      amounts,
      global,
      labelings.find(l => l.id == productLabeling.labeling),
      product,
      productLabeling
    );
    data.prices.forEach(p => (p.enabled = productLabeling.enabled));
    data.pricesSale.forEach(p => (p.enabled = product.sale ? productLabeling.enabled : false));
    reuseIDs(productLabeling.prices, data.prices);
    reuseIDs(productLabeling.prices_sale, data.pricesSale);
    productLabeling.index = i;
    productLabeling.prices = data.prices;
    productLabeling.prices_sale = data.pricesSale;
  }
  return productLabelings;
}

async function recalculateProduct(amounts, global, labelings, productLabelings, swapLabelings = {}) {
  // Recalculates prices, pricesSale and prices for all labelings.
  // Updates state (enabled) of each pricePerAmount.
  // Then updates the product in the database.
  // options.swapLabelings: { oldID: newID, ... }  <-- newID can be null to remove the labeling

  for (const [oldID, newID] of swapLabelings.entries()) {
    const i = productLabelings.findIndex(l => l.labeling === oldID);
    if (newID === null) {
      productLabelings.splice(i, 1);
    } else productLabelings[i].labeling = newID;
  }

  calculateLabelings(amounts, global, labelings, productLabelings);

  // TODO: update customPrices and customPricesSale

  const updates = {
    price_view: options.newPriceView ?? product.price_view,
    labelings: productLabelings.map(({ id, index, labeling, prices, prices_sale }) => {
      return { id, index, labeling, prices, prices_sale };
    })
  };
  await api.items('products').updateOne(product.id, updates);
}

export async function recalculateProducts(filter, options = { newPriceView: null, swapLabelings: {} }) {
  // Uses `recalculateProduct()` to update all products that match the filter.
  // A new price view can be set, and labelings can be swapped or deleted.
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
        product.labelings,
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
