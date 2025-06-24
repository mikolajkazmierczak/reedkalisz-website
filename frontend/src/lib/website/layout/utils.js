import { invalidate } from '$app/navigation';
import { uid } from '%/utils';
import api, { baseUrl } from '$/api';

const createTile = $ => ({
  _id: uid(),
  _empty: $?._empty ?? false,
  row: $.row, // required
  column: $.column, // required
  width: $.width, // required
  height: $.height, // required
  title: $?.title ?? '',
  subtitle: $?.subtitle ?? '',
  button: $?.button ?? '',
  uri: $?.uri ?? '',
  img: $?.img ?? '',
  dark: $?.dark ?? false, // dark text
  contrast: $?.contrast ?? false, // dark or light background depending on text color
  red: $?.red ?? false // red background
});

export const create = {
  title: $ => ({
    _id: uid(),
    type: 'title',
    hide: $?.hide ?? false,
    title: $.title, // required
    subtitle: $?.subtitle ?? '',
    button: $?.button ?? '',
    uri: $?.uri ?? ''
  }),
  tiles: $ => ({
    _id: uid(),
    type: 'tiles',
    hide: $?.hide ?? false,
    tiles: $.tiles.map(tile => createTile(tile)) // required
  }),
  tile: $ => createTile($),
  category: $ => ({
    _id: uid(),
    type: 'category',
    hide: $?.hide ?? false,
    slug: $.slug // required
  }),
  whitespace: $ => ({
    _id: uid(),
    type: 'whitespace',
    hide: $?.hide ?? false
  })
};

export function parseLayout(layout) {
  // adds ids (to each element and tile) and keys for missing properties
  return layout.map(element => {
    const { type } = element;
    return create[type](element);
  });
}

export function parseBack(parsed) {
  // parse layout back to original format
  // remove temporary properties (starting with '_') and properties with empty values

  const values = [undefined, null, '', false];
  const clear = (key, obj) => (key.startsWith('_') || values.includes(obj[key])) && delete obj[key];

  return parsed.map(element => {
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

function isUUID(str) {
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
    const isExternal = hostname !== window.location.hostname;
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
