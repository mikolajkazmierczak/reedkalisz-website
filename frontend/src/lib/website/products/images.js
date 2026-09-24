import { baseUrl } from '$/api';

/** A product's card images, in order: its gallery, then each enabled variant's pictures. */
export function productImages({ gallery, storage }) {
  return [
    ...gallery.filter((g) => g.enabled && g.img),
    ...storage.filter((s) => s.enabled).flatMap((s) => s.img.filter((i) => i.enabled && i.img)),
  ].map(({ img }) => `${baseUrl}/assets/${img}?key=medium`);
}

/** Warms the browser cache with each product's first image, so swapping them in doesn't flash. */
export function preloadImages(products) {
  for (const product of products) {
    if (product.url) continue; // a promo tile
    const [src] = productImages(product);
    if (src) new Image().src = src;
  }
}
