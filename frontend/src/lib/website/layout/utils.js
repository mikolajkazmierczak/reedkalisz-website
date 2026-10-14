import { invalidate } from '$app/navigation';
import { uid } from '%/utils';
import api, { baseUrl } from '$/api';
import { GROUNDS } from '#/layout/grounds';

const createTile = ($) => ({
  _id: uid(),
  row: $.row, // required
  column: $.column, // required
  width: $.width, // required
  height: $.height, // required
  title: $?.title ?? '',
  subtitle: $?.subtitle ?? '',
  button: $?.button ?? '',
  uri: $?.uri ?? '',
  img: $?.img ?? '',
  // the pastel it stands on and how its picture takes the banner (see grounds). One from before the grounds had its
  // photo over the whole banner (and red, dark and contrast, its text's colours: gone, the text has its card)
  ground: $?.ground || GROUNDS[0].id,
  fit: $?.fit ?? 'full-cover',
  margin: $?.margin ?? false, // its picture's room inset from the banner's edges and the card (see Tile)
  hide: $?.hide ?? false,
});

export const create = {
  title: ($) => ({
    _id: uid(),
    type: 'title',
    hide: $?.hide ?? false,
    title: $.title, // required
    subtitle: $?.subtitle ?? '',
    button: $?.button ?? '',
    uri: $?.uri ?? '',
  }),
  tiles: ($) => ({
    _id: uid(),
    type: 'tiles',
    hide: $?.hide ?? false,
    tiles: $.tiles.map((tile) => createTile(tile)), // required
  }),
  tile: ($) => createTile($),
  category: ($) => ({
    _id: uid(),
    type: 'category',
    hide: $?.hide ?? false,
    slug: $.slug, // required
  }),
  catalogue: () => ({ _id: uid(), type: 'catalogue' }),
  headquarters: () => ({ _id: uid(), type: 'headquarters' }),
};

/** A banner added in the editor at `place` ({ row, column }): a cell, its texts there to be written over. */
export const newBanner = (place) =>
  createTile({ ...place, width: 1, height: 1, title: 'Nowy baner', button: 'Zobacz' });

/** Built into the page: always there, once, and can't be hidden, edited or deleted; other blocks go around them. */
export const FIXED = ['catalogue', 'headquarters'];

/**
 * Adds ids and missing keys. Drops retired types (e.g. 'whitespace') so old layouts still load. A missing fixed block
 * goes first, where it sat before it joined the layout.
 */
export function parseLayout(layout) {
  const first = (e, i, all) => !FIXED.includes(e.type) || all.findIndex((x) => x.type === e.type) === i;
  const known = layout.filter((e) => create[e.type]).filter(first);
  const missing = FIXED.filter((type) => !known.some((e) => e.type === type)).map((type) => ({ type }));
  return [...missing, ...known].map((element) => create[element.type](element));
}

export function parseBack(parsed) {
  // parse layout back to original format
  // remove temporary properties (starting with '_') and properties with empty values

  const values = [undefined, null, '', false];
  const clear = (key, obj) => (key.startsWith('_') || values.includes(obj[key])) && delete obj[key];

  return parsed.map((element) => {
    for (const key in element) {
      if (key === 'tiles') {
        for (const tile of element.tiles) {
          for (const key in tile) {
            clear(key, tile);
          }
        }
      } else {
        clear(key, element);
      }
    }
    return element;
  });
}

export function isUUID(str) {
  // Check if the string is a valid UUID (version 1-5)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function parseImg(uri) {
  if (!uri) return null;
  if (isUUID(uri)) return `${baseUrl}/assets/${uri}`; // internal asset (UUID)
  return uri;
}

export function parseHref(uri) {
  const empty = { href: null, target: null };
  if (!uri) return empty;
  if (uri.startsWith('/api/assets/')) {
    return { href: uri, target: '_blank' }; // internal asset (/api/assets/...)
  }
  if (uri.startsWith('/')) {
    return { href: uri, target: '_self' }; // internal route (/...)
  }
  try {
    const { hostname, pathname } = new URL(uri);
    const isExternal = hostname !== globalThis.location?.hostname;
    if (isExternal) {
      return { href: uri, target: '_blank' }; // external url (http://...)
    } else {
      return { href: pathname, target: '_self' }; // internal route (/...) converted from internal url (http://...)
    }
  } catch (err) {
    return empty;
  }
}

export async function save(data) {
  // save to api and refresh layout
  if (!data) throw new Error('Data is empty');
  await api.items('fragments').updateOne(12, { data });
  invalidate('website:layout');
}
