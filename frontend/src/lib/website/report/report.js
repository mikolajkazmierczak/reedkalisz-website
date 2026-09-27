import { baseUrl } from '$/api';
import { reportDocument, reportImages, fonts } from './reportDocument.js';

// The product's card ("Karta produktu"): the product as its page shows it, as a PDF to download - made in the browser
// (the admin's "PDF", the page's "Karta produktu / PDF"), never on the server. Imported on click, so pdfmake (big) is
// only loaded by whoever makes one.

// the photo's longest side, px: the main one prints ~8 cm wide, the rest are thumbnails
const SIZES = { large: 1000, small: 400 };

// A file as a JPEG data URL (pdfmake takes JPEG and PNG, Directus serves WebP too), flattened on white.
// The small ones come from the `medium` preset (the only sizes Directus makes), the main one from the original.
async function jpeg(id, size) {
  const res = await fetch(`${baseUrl}/assets/${id}${size === 'small' ? '?key=medium' : ''}`);
  if (!res.ok) throw new Error(`${res.status} ${id}`);
  const bitmap = await createImageBitmap(await res.blob());
  const scale = Math.min(1, SIZES[size] / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.85);
}

// an image that won't load leaves its frame empty, the report is still made
async function loadImages(product) {
  const images = {};
  await Promise.all(
    reportImages(product).map(async ({ id, size }) => {
      images[id] = await jpeg(id, size).catch(() => null);
    }),
  );
  return images;
}

async function loadLogo() {
  const svg = await (await fetch('/logo.svg')).text();
  return svg.slice(svg.indexOf('<svg')); // without the xml prolog and doctype
}

// "R08424 Kubek izotermiczny Secure 400 ml.pdf", without what a file name can't have
const filename = (product) =>
  `${product.code} ${product.name}`
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() + '.pdf';

/**
 * Makes and downloads the card of a product as its page reads it (`readProduct`): `categories` the flat list (the
 * page's items, the admin's store), `enabled` whether it's on the website (a hidden one says so).
 */
export async function downloadReport(product, { categories, enabled = true }) {
  const [{ default: pdfMake }, logo, images] = await Promise.all([import('pdfmake'), loadLogo(), loadImages(product)]);

  const origin = window.location.origin;
  pdfMake.addFonts(
    Object.fromEntries(
      Object.entries(fonts).map(([family, faces]) => [
        family,
        Object.fromEntries(Object.entries(faces).map(([face, file]) => [face, `${origin}/fonts/pdf/${file}`])),
      ]),
    ),
  );
  // nothing but our fonts is fetched (the images come in as data)
  pdfMake.setUrlAccessPolicy((url) => url.startsWith(`${origin}/fonts/pdf/`));

  const doc = reportDocument({ ...product, enabled }, { categories, images, logo, date: new Date() });
  await pdfMake.createPdf(doc).download(filename(product));
}
