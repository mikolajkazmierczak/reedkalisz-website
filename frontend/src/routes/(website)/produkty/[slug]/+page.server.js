import api from '$/api';
import { makeTree } from '%/utils';
import { preloadSlider } from '#/products/slider';
import { readProduct, deepestCategory } from './product';

/** Server-side, the same for everyone. A hidden product comes back empty; +page.js takes it from there. */
export async function load({ params, parent }) {
  const [product, { categoriesItems }] = await Promise.all([readProduct(api, params.slug), parent()]);
  if (!product) return { product: null, similar: null };
  const categoriesTree = makeTree(categoriesItems.filter((c) => c.enabled));
  const slug = deepestCategory(product.categories, categoriesTree)?.slug;
  const similar = slug ? await preloadSlider(api, slug, categoriesItems, categoriesTree, [product.id]) : null;
  return { product, similar };
}
