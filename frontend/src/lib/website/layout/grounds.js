// The grounds a banner stands on: light tints of the site's own colours, the neutral first (a new banner's). Its
// picture lies on it: a cut-out product (a transparent PNG) shows the ground round it, a photo covers it.
export const GROUNDS = [
  { id: 'papier', name: 'Papier', hex: '#efece6' },
  { id: 'stal', name: 'Stal', hex: '#e1e6ea' },
  { id: 'niebo', name: 'Niebo', hex: '#dfe7f2' }, // the navy's
  { id: 'lawenda', name: 'Lawenda', hex: '#e7e1f2' }, // the "Nowość" badge's purple
  { id: 'roz', name: 'Róż', hex: '#f6dfe2' }, // REED red's
  { id: 'brzoskwinia', name: 'Brzoskwinia', hex: '#fbe4d4' }, // the contact orange's
  { id: 'maslo', name: 'Masło', hex: '#f6eecd' },
  { id: 'mieta', name: 'Mięta', hex: '#dbece2' }, // the "Bestseller" badge's green
];

export const groundHex = (id) => GROUNDS.find((g) => g.id === id)?.hex ?? GROUNDS[0].hex;

/**
 * How the picture takes the banner: in the room beside the text (from the card's edge to the banner's) or in the whole
 * banner, covering it (as big as covering it takes; what sticks out runs under the card and is cut by the banner's
 * edges: a photo, or a product already cut off by its photo's edge) or contained (whole, edge to edge, a soft shadow
 * under it; a cut-out product). Centred either way. A banner's `margin` insets the room from the banner's edges and
 * the card, for a picture with no room of its own round it.
 */
export const FITS = [
  {
    id: 'side-cover',
    name: 'Pokryj obok napisu',
    hint: 'Wypełnia miejsce obok napisu; co wystaje, chowa się pod kartą i za brzegami baneru.',
  },
  {
    id: 'side-contain',
    name: 'Zmieść obok napisu',
    hint: 'Cały obok napisu, od brzegu do brzegu: najlepiej PNG z przezroczystym tłem.',
  },
  {
    id: 'full-cover',
    name: 'Pokryj',
    hint: 'Wypełnia cały baner, przycięte jego krawędziami; napis na karcie nad nim.',
  },
  { id: 'full-contain', name: 'Zmieść', hint: 'Cały na środku baneru, od brzegu do brzegu; karta z napisem nad nim.' },
];

/**
 * A banner's picture as Directus's `banner` preset gives it: WebP, at most 1600 wide, its transparency kept - once
 * the preset exists (`preset`, the homepage's load finds out). Only for Directus's own files; anything else is used
 * as given.
 */
export function productSrc(url, preset) {
  if (!preset || !url || !/\/assets\/[0-9a-f-]{36}/i.test(url) || /[?&]key=/.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}key=banner`;
}
