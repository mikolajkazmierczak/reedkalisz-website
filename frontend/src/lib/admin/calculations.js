import { get } from 'svelte/store';
import api from '$lib/api';
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

export function calculateLabeling(amounts, global, labeling, product, productLabeling) {
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
  const blacklist = price_sale_blacklist
    ? price_sale_blacklist
        .split(';')
        .map(p => Number(p))
        .filter(a => a)
    : null; // filter NaN (trailing `;`)
  const amountsSale = blacklist ? amounts.filter(a => !blacklist.includes(a)) : amounts;
  return {
    prices: amounts.map(amount => pricePerAmount(amount, price)),
    // if the sale amount is blacklisted, push an empty pricePerAmount
    pricesSale: amounts.map(amount => pricePerAmount(amount, amountsSale.includes(amount) ? price_sale : null))
  };
}

export async function recalculateProducts(filter, newPriceView = null) {
  const globalMarginsStore = get(globalMargins);
  const priceViewsStore = get(priceViews);
  const labelingsStore = get(labelings);

  const products = (await api.items('products').readByQuery({ fields: productFields, filter })).data;
  console.log(products);

  // calculate new prices for each product labeling
  for (const product of products) {
    if (newPriceView !== null) product.price_view = newPriceView;
    const priceView = priceViewsStore.find(pv => pv.id == product.price_view);
    for (const labeling of product.labelings) {
      const data = calculateLabeling(
        priceView.amounts,
        globalMarginsStore,
        labelingsStore.find(l => l.id == labeling.labeling),
        product,
        labeling
      );
      data.prices.forEach(p => (p.enabled = labeling.enabled));
      data.pricesSale.forEach(p => (p.enabled = product.sale ? labeling.enabled : false));
      reuseIDs(labeling.prices, data.prices);
      reuseIDs(labeling.prices_sale, data.pricesSale);
      labeling.prices = data.prices;
      labeling.prices_sale = data.pricesSale;
    }
  }
  // save products
  for (const product of products) {
    const labelings = product.labelings.map(({ id, prices, prices_sale }) => ({ id, prices, prices_sale }));
    const updates = { labelings };
    if (newPriceView !== null) updates.price_view = newPriceView;
    await api.items('products').updateOne(product.id, updates);
  }

  return {
    products,
    ids: products.map(p => p.id)
  };
}
