import api from '$/api';
import { SearchParams } from '$/searchparams';
import { treeGetAllChildrenIDs } from '%/utils';

const fields = [
  'id',
  'name',
  'code',
  'slug',
  'enabled',
  'new',
  'sale',

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
  'gallery.img'
];

export async function load({ url, parent, params }) {
  const getFilter = async (query, slug) => {
    // by search query
    if (query) {
      return { _or: [{ name: { _contains: query } }, { code: { _contains: query } }] };
    }
    // by category
    if (slug && slug != '_') {
      const categoryOptions = { filter: { slug }, fields: ['id'] };
      const category = (await api.items('categories').readByQuery(categoryOptions)).data[0].id;
      const getIDs = c => [c, ...treeGetAllChildrenIDs(categories, c)];
      return { categories: { category: { _in: getIDs(category) } } };
    }
    // all products
    return {};
  };

  const { menus, categories } = await parent();
  const { q: query } = SearchParams.parseSearchToParams(url.search);

  const filter = await getFilter(query, params.slug);
  const products = (await api.items('products').readByQuery({ filter, fields, limit: -1 })).data;
  return { menus, products };
}
