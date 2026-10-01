// A product's thumbnail in the admin's lists: its first gallery image, or else the first image of its first variants.
// Read with only those (`thumbFields`, `thumbDeep` as the query's `deep`), and shown in the "mini" preset (64 x 64,
// cover, see Thumb).

export const thumbFields = ['gallery.img', 'storage.img.img'];

const firstOnly = { _sort: ['index'], _limit: 1 };
// (a few variants: the first may have no image)
export const thumbDeep = { gallery: firstOnly, storage: { _sort: ['index'], _limit: 3, img: firstOnly } };

// -> the file's id, or null
export const productThumb = (product) =>
  product?.gallery?.[0]?.img ?? product?.storage?.find((s) => s.img?.[0]?.img)?.img[0].img ?? null;

// a supplier's product in its last scan (not imported): its first picture's url there - its gallery's, or else its
// first variant with any -> url or null
export const scanThumb = (item) => item?.gallery?.[0] ?? item?.storage?.find((s) => s.img?.length)?.img[0] ?? null;
