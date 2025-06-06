import { error } from '@sveltejs/kit';
import api from '$/api';

const fields = [
  'id',
  'name',
  'slug',
  'code',
  'company.name',
  'enabled',
  'new',
  'bestseller',
  'coming_soon',
  'out_of_stock',

  'categories.id',
  'categories.index',
  'categories.category',

  'seo_title',
  'seo_description',
  'description',
  'commercial_details.content',
  'size_x',
  'size_y',
  'size_z',
  'materials',

  'sale',
  'custom_prices_with_labeling',
  'labeling_place',
  'labeling_field_x',
  'labeling_field_y',

  'custom_prices.enabled',
  'custom_prices.amount',
  'custom_prices.price',
  'custom_prices_sale.enabled',
  'custom_prices_sale.amount',
  'custom_prices_sale.price',

  'labelings.enabled',
  'labelings.labeling_place',
  'labelings.labeling_field_x',
  'labelings.labeling_field_y',

  'labelings.labeling.code',
  'labelings.labeling.type',
  'labelings.labeling.name',

  'labelings.prices.enabled',
  'labelings.prices.amount',
  'labelings.prices.price',
  'labelings.prices_sale.enabled',
  'labelings.prices_sale.amount',
  'labelings.prices_sale.price',

  'gallery.enabled',
  'gallery.main',
  'gallery.img',

  'storage.enabled',
  'storage.amount',
  'storage.multicolored',
  'storage.api_color_code',

  // colors are always enabled
  'storage.color_first.name',
  'storage.color_first.color',
  'storage.color_second.name',
  'storage.color_second.color',

  'storage.img.enabled',
  'storage.img.img',
  'storage.img.show_in_gallery'
];

export async function load({ params }) {
  const { slug } = params;
  const filter = { slug: { _eq: slug } };
  const product = (await api.items('products').readByQuery({ filter, fields })).data[0];
  if (!product) throw error(404, '404');
  return { product };
}
