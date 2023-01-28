import { reuseIDs } from './utils';

function pushPrice(prices, { amount = null, price = null }) {
  prices.push({ amount, price });
}

function pushCounterparts(prices1, prices2) {
  // Pushes each `prices1` amount to `prices2` if it's missing it.
  // e.g.: in   2 1 4   ; 1 3
  //       out  2 1 4 3 ; 1 3 2 4
  for (const p1 of prices1) {
    const amount = p1.amount;
    const amountExists = prices2.some(p2 => p2.amount == amount);
    if (!amountExists) pushPrice(prices2, { amount });
  }
}
function removeDuplicates(prices) {
  // Removes each duplicate amount from `prices`.
  // e.g.: in   2 3 3 4
  //       out  2 3 4
  return prices.reduce((acc, p) => {
    const amountExists = acc.some(a => a.amount == p.amount);
    return amountExists ? acc : [...acc, p];
  }, []);
}

function removeUnused(amounts, prices) {
  // Removes amounts from `prices` that are not in the `amounts` array.
  // e.g.: amounts = [1, 2, 3]
  //       in   2 5 1
  //       out  2 1
  return prices.filter(p => amounts.includes(p.amount));
}
function pushMissing(amounts, prices) {
  // Pushes each amount from `amounts` that is not in the `prices` array.
  // e.g.: amounts = [1, 2, 3, 4]
  //       in   1 3 5
  //       out  1 3 5 4
  for (const amount of amounts) {
    const p = prices.some(p => p.amount == amount);
    if (!p) pushPrice(prices, { amount });
  }
}
function sortByAmount(prices) {
  // sort items by their amounts
  prices.sort((a, b) => a.amount - b.amount);
}
function reusePrices(prices, reusablePrices) {
  // Reuse prices from `reusablePrices` array.
  // Uses THE FIRST ENCOUNTERED PRICE in `reusablePrices` for each amount.
  for (let price of prices) {
    const amount = price.amount;
    const reusablePrice = reusablePrices.find(p => p.amount == amount);
    if (reusablePrice) price.price = reusablePrice.price;
  }
}
function reuse(prices, reusable) {
  if (reusable.length) {
    const reusableIDs = reusable.map(p => p.id);
    const reusablePrices = reusable.map(({ amount, price }) => ({ amount, price }));
    reuseIDs(prices, reusableIDs);
    reusePrices(prices, reusablePrices);
  }
}

export function repairPrices(prices1, prices2) {
  pushCounterparts(prices1, prices2);
  pushCounterparts(prices2, prices1);
  prices1 = removeDuplicates(prices1);
  prices2 = removeDuplicates(prices2);
  return [prices1, prices2];
}

export function cleanupPrices(amounts, prices1, prices2, pricesReusable = null) {
  // `pricesReusable`: {
  //   prices1: { id: int, amount: int, price: int }, ... },
  //   prices2: { id: int, amount: int, price: int }, ... }
  // }
  pushMissing(amounts, prices1);
  pushMissing(amounts, prices2);
  prices1 = removeUnused(amounts, prices1);
  prices2 = removeUnused(amounts, prices2);
  sortByAmount(prices1);
  sortByAmount(prices2);

  // ONLY REALLY RELEVANT FOR THE ADMIN PANEL
  if (pricesReusable) {
    // reuse pricePerAmount IDs to avoid the db removing old items and creating new ones
    reuse(prices1, pricesReusable.prices1);
    reuse(prices2, pricesReusable.prices2);
  }

  return [prices1, prices2];
}
