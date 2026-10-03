import api from '$/api';
import { usedFiles } from '@/files';
import { fileProps } from '@c/library/File.svelte';
import { scanProduct, scanVariant } from '@/match';
import { orderVariants } from '%/order';

// Images follow the api too: the variants' and the product's own (its gallery - few apis have one). Every image the api
// gives is remembered on the product in `api_images`, keyed by its url:
//   { file: id }        imported by us, it is that file (`gallery: true` - into the gallery, maybe moved since)
//   { rejected: true }  an admin removed it, or refused it - it never comes back
//   {}                  was already there before this was tracked
// A new image waits for an admin's approval, and one gone from the api is removed from the product, wherever it is in
// it (its gallery, any variant) - but only while every variant of the product is in the scan (a retired one holds
// that back until Posprzątaj removes it).
// An image the api shows in several variants is one file, in all of them.

// What an imported image is called in the library: the n-th of the api's images (from 0, an admin's own not counted)
// of a variant, 'MO9469 / MO9469-03 / #1', or of the gallery (no storage), 'MO9469 / #1' - its company is a field of
// its own (scripts/archive/migrate-file-names.mjs named the earlier ones so too)
export const imageTitle = (product, storage, place) =>
  [product.code, ...(storage ? [storage.api_color_code || product.code] : []), `#${place + 1}`].join(' / ');

export async function importSource(source, title, company) {
  // Directus downloads the image into the library itself. -> file id, or null
  try {
    return (await api.files.import({ url: source, data: { title, company } })).id;
  } catch (e) {
    console.warn(`failed image import (${source})`, e);
    return null;
  }
}

// the name Directus gives a file imported from a url
export function basename(source) {
  const name = new URL(source).pathname.split('/').pop();
  try {
    return decodeURI(name);
  } catch {
    return name; // a stray '%' (as in '50%.jpg') isn't an escape
  }
}
export const stem = (name) => name?.replace(/\.[^.]*$/, '').toLowerCase();

// the library's data of files (see File) -> Map(id -> file)
export async function readFiles(ids) {
  const unique = [...new Set(ids)].filter(Boolean);
  const fields = Object.keys(fileProps({}));
  const files = new Map();
  for (let i = 0; i < unique.length; i += 100) {
    // (as a CSV: Directus reads a url list of more than 20 as an object, which matches nothing)
    const filter = { id: { _in: unique.slice(i, i + 100).join(',') } };
    for (const file of (await api.files.readByQuery({ fields, filter, limit: -1 })).data) files.set(file.id, file);
  }
  return files;
}

// the products each of these files is in (a gallery's, a variant's photo, an attachment) -> Map(id -> Set(product id))
async function productsOf(ids) {
  const unique = [...new Set(ids)].filter(Boolean);
  const products = new Map();
  const add = (file, product) => file && product && products.set(file, (products.get(file) ?? new Set()).add(product));
  const read = (collection, fields, filter) => api.items(collection).readByQuery({ fields, filter, limit: -1 });
  for (let i = 0; i < unique.length; i += 100) {
    const _in = unique.slice(i, i + 100).join(','); // (as a CSV, see readFiles)
    const [gallery, photos, attachments] = await Promise.all([
      read('products_image', ['img', 'product'], { img: { _in } }),
      read('products_storage_image', ['img', 'products_storage.product'], { img: { _in } }),
      read('products_attachment', ['file', 'product'], { file: { _in } }),
    ]);
    for (const row of gallery.data) add(row.img, row.product);
    for (const row of photos.data) add(row.img, row.products_storage?.product);
    for (const row of attachments.data) add(row.file, row.product);
  }
  return products;
}

// What NewImages takes: products ({ product, known, review: what reviewPlaces takes but `known` and `files`, ... })
// with their places worked out, the library's data of their files there (`files`, read unless given), and the ones
// another product shows too added to `elsewhere` (they keep its names: a file is renamed for all of them)
export async function reviewGroups(groups, library = null) {
  const used = groups.map((g) => [...usedFiles(g.product)]);
  const [files, products] = await Promise.all([library ?? readFiles(used.flat()), productsOf(used.flat())]);
  return groups.map(({ review, ...g }, i) => {
    const shared = used[i].filter((file) => [...(products.get(file) ?? [])].some((p) => p !== g.product.id));
    return {
      ...g,
      files,
      elsewhere: new Set([...(g.elsewhere ?? []), ...shared]),
      places: reviewPlaces({ ...review, known: g.known, files }),
    };
  });
}

// Where a product's images go, as an admin looks through the new ones (see NewImages): its gallery, then each of
// `variants` in the order of their codes - each with the images there now (`rows(storage)`, null for the gallery),
// the api's (their `source`) and an admin's own (none), in their order, and the new ones there (`fresh`: source -> its
// variants, none for the gallery) put among them where the api has them (`order(storage)`: its sources there, in its
// order, kept as `api`). An admin's order and removals stand, the api's fills in around them.
// An image there is the api's when imported from it (`known`), or - from before they were tracked - when its name is
// one of the api's there (our importer kept the url's name, if not its extension: `files`, the library's data).
// -> [{ storage, api, tiles: [{ key, row, file, source, fresh }] }]
export function reviewPlaces({ variants, rows, order, fresh, known, files }) {
  const sourceOf = new Map(Object.entries(known ?? {}).flatMap(([source, { file }]) => (file ? [[file, source]] : [])));
  return [null, ...orderVariants(variants)].map((storage) => {
    const api = [...new Set(order(storage))].filter(Boolean);
    const untracked = new Map(); // stem -> its sources, each taken by one file
    for (const s of api) {
      if (!known?.[s] || known[s].file || known[s].rejected) continue;
      untracked.set(stem(basename(s)), [...(untracked.get(stem(basename(s))) ?? []), s]);
    }
    const tiles = rows(storage).map((row) => ({
      key: row.id ?? `file:${row.img}`,
      row,
      file: row.img,
      source: sourceOf.get(row.img) ?? untracked.get(stem(files?.get(row.img)?.filename_download))?.shift() ?? null,
      fresh: false,
    }));
    for (const source of api) {
      const goes = fresh.get(source);
      if (!goes || (storage ? !goes.includes(storage) : goes.length) || tiles.some((t) => t.source === source))
        continue;
      tiles.splice(placeFor(tiles, api, source), 0, { key: source, source, fresh: true });
    }
    return { storage, api, tiles };
  });
}

// where a new image goes among a place's tiles: after the nearest one before it in the api's order that's there, else
// before the nearest one after it, else last
export function placeFor(tiles, api, source) {
  const at = (s) => tiles.findIndex((t) => t.source === s);
  const i = api.indexOf(source);
  if (i >= 0) {
    for (let j = i - 1; j >= 0; j--) if (at(api[j]) >= 0) return at(api[j]) + 1;
    for (let j = i + 1; j < api.length; j++) if (at(api[j]) >= 0) return at(api[j]);
  }
  return tiles.length;
}

// What the api's images of looked-through places are called (see imageTitle): the n-th of the api's in their place (an
// admin's own not counted, nor the ones `skip(tile)` leaves out), after the first place they're in that's `shown`
// (else their first); one the product shows elsewhere too (`elsewhere`) keeps its name
// -> Map(file, or a new one's source -> { title, place })
export function namesOf({ product, places, elsewhere }, skip) {
  const names = new Map();
  const visits = places.map((place, p) => ({ place, p })).sort((a, b) => !!b.place.shown - !!a.place.shown);
  for (const { place, p } of visits) {
    let n = 0;
    for (const tile of place.tiles) {
      if (!tile.source || skip(tile)) continue;
      const name = tile.file ?? tile.source;
      if (!names.has(name) && !elsewhere?.has(tile.file))
        names.set(name, { title: imageTitle(product, place.storage, n), place: p });
      n++;
    }
  }
  return names;
}

// the files of a looked-through product to rename, in the places shown: the ones there already, and the new ones
// downloaded (`files`: source -> file) under another name than they now take (one before them failed); the ones taken
// off (refused, removed) not counted
export function renamesOf(group, files) {
  const names = namesOf(group, (t) => t.rejected || (t.fresh && !files.has(t.source)));
  const downloadedAs = new Map(
    group.places.flatMap((p) => p.tiles.filter((t) => t.fresh).map((t) => [t.source, t.title])),
  );
  const renames = [];
  for (const [name, { title, place }] of names) {
    if (!group.places[place].shown) continue;
    const [file, was] = files.has(name)
      ? [files.get(name), downloadedAs.get(name)]
      : [name, group.files?.get(name)?.title];
    if (was !== undefined && was !== title) renames.push({ file, title });
  }
  return renames;
}

// whether the rows of the places shown changed since they were read (`before`, see NewImages; an admin saved the
// product meanwhile): they're written as looked through, which would undo that
export async function changedMeanwhile(product, places) {
  const fields = ['gallery.id', 'gallery.index', 'storage.id', 'storage.img.id', 'storage.img.index'];
  const now = await api.items('products').readOne(product.id, { fields });
  const rows = (storage) => (storage ? now.storage?.find((s) => s.id === storage.id)?.img : now.gallery) ?? [];
  const key = (rows) =>
    rows
      .map((r) => `${r.id}:${r.index}`)
      .sort()
      .join();
  return places
    .filter((p) => p.shown)
    .some((p) => key(rows(p.storage)) !== key(p.before ?? p.tiles.filter((t) => !t.fresh).map((t) => t.row)));
}

// The new images of looked-through places downloaded, each once and as the review named it (`title`), and remembered
// in `known`: the refused never come back, one that failed isn't (the next scan offers it again) -> Map(source -> file)
export async function downloadImages(places, known, company, failed) {
  const first = new Map(); // source -> its first tile (its name's)
  for (const tile of places.flatMap((p) => p.tiles))
    if (tile.fresh && !first.has(tile.source)) first.set(tile.source, tile);
  const toGallery = new Set(places[0].tiles.filter((t) => t.fresh).map((t) => t.source));
  const files = new Map();
  for (const [source, { rejected, title }] of first) {
    if (rejected) {
      known[source] = { rejected: true };
      continue;
    }
    const file = await importSource(source, title, company);
    if (!file) {
      failed.push(source);
      continue;
    }
    files.set(source, file);
    known[source] = toGallery.has(source) ? { file, gallery: true } : { file };
  }
  return files;
}

// a looked-through place's rows as they're saved: the ones kept, in their order (a new one as its file; without one -
// refused, or not downloaded - left out; one there already removed, left out too)
export const keptRows = (place, files) =>
  place.tiles
    .filter((t) => !t.rejected && (!t.fresh || files.has(t.source)))
    .map((t) => (t.fresh ? { img: files.get(t.source) } : t.row));
// the rows of the places shown that were there before (`before`, see NewImages) and aren't kept - removed, or moved to
// another place -> { gallery, variants: [row id] }
export function droppedOf(places, files) {
  const dropped = { gallery: [], variants: [] };
  for (const place of places.filter((p) => p.shown)) {
    const kept = new Set(keptRows(place, files).map((r) => r.id));
    const ids = (place.before ?? []).filter((r) => r.id != null && !kept.has(r.id)).map((r) => r.id);
    dropped[place.storage ? 'variants' : 'gallery'].push(...ids);
  }
  return dropped;
}

// Rows numbered in their order (a gallery's first one its main) -> `changed` on those of the db to update
export const numberRows = (rows) =>
  rows.map((row, index) => ({ ...row, index, changed: row.id != null && row.index !== index }));
export const numberGallery = (rows) =>
  rows.map((row, index) => ({
    ...row,
    index,
    main: index === 0,
    changed: row.id != null && (row.index !== index || !!row.main !== (index === 0)),
  }));
// in the order the site shows them (by index, the ones without one last)
export const inPlace = (a, b) =>
  (a.index == null) - (b.index == null) || (a.index ?? 0) - (b.index ?? 0) || a.id - b.id;
export const arrangeGallery = (rows) => numberGallery([...rows].sort(inPlace));

// numbered rows saved: the new ones created, the ones there renumbered - a product's gallery (its id), a variant's
// images (its id)
export async function writeGallery(product, rows) {
  const created = rows
    .filter((r) => r.id == null)
    .map(({ img, index, main }) => ({ product, img, index, main, enabled: true }));
  if (created.length) await api.items('products_image').createMany(created);
  const changed = rows.filter((r) => r.changed).map(({ id, index, main }) => ({ id, index, main }));
  if (changed.length) await api.items('products_image').updateBatch(changed);
}
export async function writeVariantImages(storage, rows) {
  const created = rows
    .filter((r) => r.id == null)
    .map(({ img, index }) => ({ products_storage: storage, img, index, enabled: true }));
  if (created.length) await api.items('products_storage_image').createMany(created);
  const changed = rows.filter((r) => r.changed).map(({ id, index }) => ({ id, index }));
  if (changed.length) await api.items('products_storage_image').updateBatch(changed);
}

// the rows taken out of looked-through places (see droppedOf) deleted: last, once every place's rows are written, so
// one failing halfway can't lose an image moved from one place to another (the files stay in the library either way)
export async function deleteRows({ gallery = [], variants = [] }) {
  if (gallery.length) await api.items('products_image').deleteMany(gallery);
  if (variants.length) await api.items('products_storage_image').deleteMany(variants);
}

// files renamed (see renamesOf)
export async function renameFiles(renames) {
  for (const { file, title } of renames ?? []) await api.files.updateOne(file, { title });
}

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
      // gone from the api: so is our copy of it, wherever an admin may have moved it (see the product editor)
      if (entry.file) {
        for (const img of product.gallery ?? []) if (img.img === entry.file) removeGallery.push(img.id);
        for (const s of product.storage ?? []) {
          for (const img of s.img ?? []) if (img.img === entry.file) remove.push(img.id);
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
