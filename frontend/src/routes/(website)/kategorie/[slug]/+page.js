export async function load({ data, parent, params }) {
  const { categoriesItems } = await parent();
  const category = categoriesItems.find((c) => c.slug === params.slug && c.enabled);
  return { ...data, category };
}
