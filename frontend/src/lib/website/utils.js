export function addLinks(items) {
  for (let item of items) {
    const productUrl = item.product ? `/produkty/${item.product.slug}` : null;
    const categoryUrl = item.category ? `/kategorie/${item.category.slug}` : null;
    const pageUrl = item.page ? `/${item.page.slug}` : null;
    item.href = productUrl || categoryUrl || pageUrl || item.url;
    if (item.children) addLinks(item.children);
  }
}
