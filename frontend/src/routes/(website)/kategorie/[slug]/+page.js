export async function load({ data, parent, params }) {
  const { categoriesItems, menus } = await parent();
  const category = categoriesItems.find((c) => c.slug === params.slug && c.enabled);
  return { ...data, category, menus };
}
