import api from '$/api';
import { usedFiles } from '@/files';
import { scanProduct, scanVariant } from '@/match';

// Images follow the api too: the variants' and the product's own (its gallery - few apis have one). Every image the api
// gives is remembered on the product in `api_images`, keyed by its url:
//   { file: id }        imported by us, it is that file (`gallery: true` - into the gallery)
//   { rejected: true }  an admin removed it, or refused it - it never comes back
//   {}                  was already there before this was tracked
// A new image waits for an admin's approval, and one gone from the api is removed from the product - but only while
// every variant of the product is in the scan (a retired one holds that back until Posprzątaj removes it).
// An image the api shows in several variants is one file, in all of them.

// What an imported image is called in the library: the n-th image (from 0) of a variant, 'MO9469 / MO9469-03 / #1', or
// of the gallery (no storage), 'MO9469 / #1' - its company is a field of its own (scripts/migrate-file-names.mjs names
// the earlier ones so too)
export const imageTitle = (product, storage, place) =>
  [product.code, ...(storage ? [storage.api_color_code || product.code] : []), `#${place + 1}`].join(' / ');

// the place (from 0) of the next image put at the end of each variant -> next(storage)
export function appending() {
  const taken = new Map();
  return (storage) => {
    const place = taken.get(storage) ?? storage.img?.length ?? 0;
    taken.set(storage, place + 1);
    return place;
  };
}

export async function importSource(source, title, company) {
  // Directus downloads the image into the library itself. -> file id, or null
  try {
    return (await api.files.import({ url: source, data: { title, company } })).id;
  } catch (e) {
    console.warn(`failed image import (${source})`, e);
    return null;
  }
}

// A gallery in the order the site shows it (by index, the ones without one last), `front` and `back` rows added around
// it: every row's index is its place and the first one is the main -> the rows, `changed` on those of the db to update
const byPlace = (a, b) => (a.index == null) - (b.index == null) || (a.index ?? 0) - (b.index ?? 0) || a.id - b.id;
export const arrangeGallery = (rows, front = [], back = []) =>
  [...front, ...[...rows].sort(byPlace), ...back].map((row, index) => ({
    ...row,
    index,
    main: index === 0,
    changed: row.id != null && (row.index !== index || !!row.main !== (index === 0)),
  }));

// the api's images of every variant we have and of the product: source -> our variants that show it, [] for the
// gallery (`scan` from indexScan)
function apiSources(product, scan) {
  const sources = new Map();
  for (const storage of product.storage ?? []) {
    for (const source of new Set(scanVariant(storage, scan)?.img ?? [])) {
      if (source) sources.set(source, [...(sources.get(source) ?? []), storage]);
    }
  }
  for (const source of scanProduct(product, scan)?.gallery ?? [])
    if (source && !sources.has(source)) sources.set(source, []);
  return sources;
}

// the images the api has now, as already known - the start of tracking a product
export const seedImages = (product, scan) =>
  Object.fromEntries([...apiSources(product, scan).keys()].map((source) => [source, {}]));

export function planImages(product, scan) {
  // -> { known: the new `api_images` (null when unchanged), candidates: [{ storages, source }] (no storages: the
  // gallery's), remove: [variant image row id], removeGallery: [gallery image row id] }
  if (!product.api_images) return { known: seedImages(product, scan), candidates: [], remove: [], removeGallery: [] };

  const sources = apiSources(product, scan);
  const used = usedFiles(product);
  const known = structuredClone(product.api_images);
  const remove = [];
  const removeGallery = [];
  let changed = false;
  // a variant missing from the scan (for now, or retired until Posprzątaj) may come back with its images: none is removed
  const partial = (product.storage ?? []).some((s) => !scanVariant(s, scan));

  for (const [source, entry] of Object.entries(known)) {
    if (entry.file && !used.has(entry.file)) {
      // removed by an admin, on purpose; one the api doesn't show now (its variant deleted, say) is only forgotten,
      // so it isn't refused for good
      if (sources.has(source)) known[source] = { rejected: true };
      else delete known[source];
      changed = true;
    } else if (!sources.has(source) && !entry.rejected && !partial) {
      // gone from the api: so is our copy of it
      // (where it was put: an admin may have put the same file in the gallery too, and that stays)
      if (entry.gallery) {
        for (const img of product.gallery ?? []) if (img.img === entry.file) removeGallery.push(img.id);
      } else {
        for (const s of product.storage ?? []) {
          for (const img of s.img ?? []) if (entry.file && img.img === entry.file) remove.push(img.id);
        }
      }
      delete known[source];
      changed = true;
    }
  }

  const candidates = [...sources]
    .filter(([source]) => !(source in known))
    .map(([source, storages]) => ({ storages, source }))
    .sort((a, b) => (a.storages.length > 0) - (b.storages.length > 0)); // the gallery's first, as the site shows it
  return { known: changed ? known : null, candidates, remove, removeGallery };
}
