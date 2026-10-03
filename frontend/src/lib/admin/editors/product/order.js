import { swatch } from '$/colors';
import { reindex } from '%/order';

// The variants and labelings are put in order by shared/order.js; the images are moved here.
export { orderVariants, sortLabelings, sortVariants } from '%/order';

// Where a product's image can go (see MoveTo): its gallery, or a variant (by its place in `product.storage`)
export const GALLERY = 'gallery';
export function imageTargets(product, colors) {
  return [
    { id: GALLERY, text: 'Galeria', icon: 'image_multiple' },
    ...product.storage.map((s, i) => {
      const color = colors?.find((c) => c.id === s.color_first);
      return {
        id: i,
        text: s.api_color_code || `Wariant ${i + 1}`,
        note: color?.name,
        ...(color && { swatch: swatch(color) }),
      };
    }),
  ];
}

// The image in `from` ('gallery' or a variant's place) at `index` moved to the end of `to`: a new row there, the old
// one gone (saving deletes it); both renumbered. -> the product
export function moveImage(product, from, index, to) {
  const rows = (where) => (where === GALLERY ? product.gallery : product.storage[where].img);
  const [row] = rows(from).splice(index, 1);
  reindex(rows(from));
  const target = rows(to);
  target.push({ img: row.img, enabled: true, index: target.length, ...(to === GALLERY && { main: !target.length }) });
  return product;
}

// Tiles left without a file (added and never picked) dropped on saving: the gallery's, the variants', the attachments';
// the rest renumbered, the gallery's first the main one again. -> the product
export function dropEmpty(product) {
  const keep = (rows, key) => reindex(rows.filter((row) => row[key] != null));
  product.gallery = keep(product.gallery, 'img');
  product.gallery.forEach((g, i) => {
    g.main = i === 0;
    if (g.main) g.enabled = true;
  });
  product.attachments = keep(product.attachments, 'file');
  product.storage.forEach((s) => (s.img = keep(s.img, 'img')));
  return product;
}
