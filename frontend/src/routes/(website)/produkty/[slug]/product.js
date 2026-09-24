import { treeGetItem } from '%/utils';
import { enabledFilter } from '#/products/fields';

/** Everything the product page shows. */
const fields = [
  'id',
  'name',
  'slug',
  'code',
  'company.name',
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
  'labelings.labeling.company.name',

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
  'storage.available',
  'storage.multicolored',
  'storage.api_color_code',

  // colors are always enabled
  'storage.color_first.name',
  'storage.color_first.color',
  'storage.color_second.name',
  'storage.color_second.color',

  'storage.img.enabled',
  'storage.img.img',
  'storage.img.show_in_gallery',
];

/** The deepest enabled category the product is in: its breadcrumbs end there, "Podobne produkty" come from it. */
export function deepestCategory(categories, categoriesTree) {
  let deepest = null;
  for (const { category: id } of categories ?? []) {
    const category = treeGetItem(categoriesTree, id);
    if (category && (!deepest || category._meta.depth > deepest._meta.depth)) deepest = category;
  }
  return deepest;
}

/** A product by slug; `hidden` also finds a disabled one, which only an admin's token can read. */
export async function readProduct(api, slug, { hidden = false } = {}) {
  const filter = { slug: { _eq: slug }, ...(hidden ? {} : enabledFilter) };
  const { data } = await api.items('products').readByQuery({ filter, fields, limit: 1 });
  return data[0] ?? null;
}
