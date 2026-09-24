import api from '$/api';
import { SLIDER_PRELOAD, sliderFilter, fetchSlider } from '#/products/slider';

export async function load({ data, depends, parent }) {
  depends('website:layout');

  const [{ data: layout }, { categoriesItems, categoriesTree }] = await Promise.all([
    api.items('fragments').readOne(12),
    parent(),
  ]);

  // Each category block's first page, so the server render already has its cards.
  const slugs = [...new Set(layout.filter((e) => e.type === 'category' && e.slug).map((e) => e.slug))];
  const sliders = Object.fromEntries(
    await Promise.all(
      slugs.map(async (slug) => {
        const filter = sliderFilter(slug, categoriesItems, categoriesTree);
        return [slug, filter ? await fetchSlider(api, filter, SLIDER_PRELOAD) : null];
      }),
    ),
  );

  return { ...data, layout, sliders };
}
