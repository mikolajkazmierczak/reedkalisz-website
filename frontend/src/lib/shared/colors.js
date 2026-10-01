// How a colour is painted. The special ones are not a flat fill:
// multicolour is the four CMYK quarters of /multicolor.svg (the website's drawing of it),
// neutral the same quarters in earthy pastels (beige, brown, clay, sage: a natural material's own colour),
// wood the rings of its end grain, off centre,
// transparent is its tint over a checkerboard (so "przezroczysty niebieski" stays blue),
// and no colour at all (a variant without one) a white dot crossed out in the grey of the swatches' ring.
// (The product card draws them the same way, see reportDocument.js.)

const MULTICOLOR = 'conic-gradient(from 45deg, #e5097f 0 25%, #2b2a29 0 50%, #ffed00 0 75%, #00a0e3 0)';
export const NEUTRAL_QUARTERS = ['#cfa58c', '#8c6c52', '#eadfc9', '#bcc3a6']; // right, below, left, on top
const NEUTRAL = `conic-gradient(from 45deg, ${NEUTRAL_QUARTERS.map((c, i) => `${c} 0 ${(i + 1) * 25}%`).join(', ')})`;
export const NO_COLOR_LINE = '#cccccc'; // the ring (black at 20%) over white, solid: where the lines cross isn't darker
const diagonal = (deg) =>
  `linear-gradient(${deg}deg, transparent calc(50% - 0.5px), ${NO_COLOR_LINE} 0 calc(50% + 0.5px), transparent 0)`;
export const NO_COLOR = `${diagonal(45)}, ${diagonal(-45)}, #ffffff`;
export const WOOD_RINGS = { light: '#dcb482', dark: '#b27a45' };
const WOOD =
  'repeating-radial-gradient(circle at 30% 70%, #d6a974 0 0.12em, #c08a55 0.12em 0.2em, #dcb482 0.2em 0.36em, ' +
  '#b27a45 0.36em 0.42em)';
const CHECKERBOARD = 'repeating-conic-gradient(#d6d6d6 0 25%, #ffffff 0 50%) 50% / 0.5rem 0.5rem';

function tint(hex, alpha) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex ?? '');
  if (!m) return `rgba(255, 255, 255, ${alpha})`;
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// -> a css `background` value, or null for no colour. A plain colour without its hex yet is `empty` (white on the
// website, as it always was; the admin passes null, to show it's missing)
export function swatch(color, empty = '#ffffff') {
  if (!color) return null;
  if (color.multicolor) return MULTICOLOR;
  if (color.neutral) return NEUTRAL;
  if (color.wood) return WOOD;
  if (color.transparent) {
    const t = tint(color.color, 0.45);
    return `linear-gradient(${t}, ${t}), ${CHECKERBOARD}`;
  }
  return color.color || empty;
}

// the colours that aren't a hex: their flag and what the admin calls them
export const COLOR_KINDS = [
  ['multicolor', 'wielokolorowy'],
  ['neutral', 'neutralny'],
  ['wood', 'drewno'],
  ['transparent', 'przezroczysty'],
];

// a plain colour that has no hex yet (the special and see-through ones don't need one)
export const colorMissing = (color) => !!color && !color.color && !COLOR_KINDS.some(([key]) => color[key]);
