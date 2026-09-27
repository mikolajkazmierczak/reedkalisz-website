// How our products are found in a supplier's scan. A variant is its whole code (`api_color_code`, e.g. 'R123-10'),
// unique at the supplier; a product's code is only a label - some suppliers have none, some repeat them. So:
//   - a variant of ours is the scan's variant with the same code, wherever it is in the scan
//   - a product of ours follows the scan's product of its first variant found there (its name, price, labelings...,
//     "the first one wins"), or - with none of its variants there - the scan's product with its code

// -> { variants: Map(code -> { item, storage }), products: Map(product code -> item) }, the first of each kept
export function indexScan(apiItems) {
  const variants = new Map();
  const products = new Map();
  for (const item of apiItems ?? []) {
    if (item.code && !products.has(item.code)) products.set(item.code, item);
    for (const storage of item.storage ?? []) {
      const code = storage.api_color_code;
      if (code && !variants.has(code)) variants.set(code, { item, storage });
    }
  }
  return { variants, products };
}

// the scan's variant of a variant of ours, or undefined
export const scanVariant = (storage, scan) => scan.variants.get(storage.api_color_code)?.storage;

// the scan's product a product of ours follows, or null
export function scanProduct(product, scan) {
  for (const storage of product.storage ?? []) {
    const found = scan.variants.get(storage.api_color_code);
    if (found) return found.item;
  }
  return scan.products.get(product.code) ?? null;
}
