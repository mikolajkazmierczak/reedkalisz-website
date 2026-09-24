export const enabledFilter = { enabled: { _eq: true } };

/** What a product card reads, and nothing more. */
export const fields = [
  'id',
  'name',
  'code',
  'slug',
  'new',
  'sale',
  'bestseller',
  'coming_soon',
  'out_of_stock',

  'price_min',
  'price_min_sale',

  'custom_prices_with_labeling',
  'custom_prices.enabled',
  'custom_prices.price',
  'custom_prices_sale.enabled',
  'custom_prices_sale.price',

  'labelings.prices.enabled',
  'labelings.prices.price',
  'labelings.prices_sale.enabled',
  'labelings.prices_sale.price',

  'storage.enabled',
  'storage.amount',
  'storage.available',
  'storage.color_first.name',
  'storage.color_first.color',
  'storage.color_second.name',
  'storage.color_second.color',
  'storage.multicolored',
  'storage.img.enabled',
  'storage.img.img',

  'gallery.enabled',
  'gallery.img',
];

/** Distinct count: `filter_count` counts category junction rows, so multi-category products count twice. */
export async function countProducts(api, filter) {
  const { data } = await api.items('products').readByQuery({ filter, aggregate: { countDistinct: 'id' } });
  return Number(data?.[0]?.countDistinct?.id ?? 0);
}
