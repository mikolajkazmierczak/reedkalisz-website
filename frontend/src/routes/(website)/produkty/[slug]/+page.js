import api from '$/api';

const productFields = [
  'id',
  'name',
  'code',
  'slug',
  'enabled',
  'new',
  'sale',
  'seo_title',
  'seo_description',
  'description',
  'commercial_details.content',
  'size_x',
  'size_y',
  'size_z',
  'materials',

  'categories.id',
  'categories.index',
  'categories.category',

  'custom_prices_with_labeling',
  'labeling_field_x',
  'labeling_field_y',
  'custom_prices.enabled',
  'custom_prices.amount',
  'custom_prices.price',
  'custom_prices_sale.enabled',
  'custom_prices_sale.amount',
  'custom_prices_sale.price',

  'labelings.enabled',
  'labelings.labeling.company.name',
  'labelings.labeling.code',
  'labelings.labeling.type',
  'labelings.labeling.name',
  'labelings.prices.enabled',
  'labelings.prices.amount',
  'labelings.prices.price',
  'labelings.prices_sale.enabled',
  'labelings.prices_sale.amount',
  'labelings.prices_sale.price',
  'labelings.labeling_field_x',
  'labelings.labeling_field_y',

  'storage.enabled',
  'storage.amount',
  'storage.color_first.enabled',
  'storage.color_first.name',
  'storage.color_first.color',
  'storage.color_second.enabled',
  'storage.color_second.name',
  'storage.color_second.color',
  'storage.multicolored',
  'storage.api_color_code',
  'storage.img.enabled',
  'storage.img.img',
  'storage.img.show_in_gallery',

  'gallery.enabled',
  'gallery.main',
  'gallery.img'
];

export async function load({ params }) {
  const { slug } = params;
  const productFilter = { slug: { _eq: slug } };
  const product = (await api.items('products').readByQuery({ filter: productFilter, fields: productFields })).data[0];
  return { product };
}
