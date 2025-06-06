export function addLinks(items) {
  for (let item of items) {
    const productUrl = item.product ? `/produkty/${item.product.slug}` : null;
    const categoryUrl = item.category ? `/kategorie/${item.category.slug}` : null;
    const pageUrl = item.page ? `/${item.page.slug}` : null;
    item.href = productUrl || categoryUrl || pageUrl || item.url;
    if (item.children) addLinks(item.children);
  }
}

export function parseColor(multicolored, first, second) {
  const bg = first ?? second; // first could be unset
  const fg = second; // doesnt matter if first is unset

  const title = bg && fg ? `${bg.name} / ${fg.name}` : bg ? bg.name : fg ? fg.name : null;
  const label = multicolored ? 'Wielokolorowy' : (title ?? 'Nieokreślony');

  return { label, bg, fg };
}
