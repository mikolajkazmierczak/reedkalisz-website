// How a colour is painted. A multicolour or a transparent one is not a flat fill:
// multicolour is the four CMYK quarters of /multicolor.svg (the website's drawing of it),
// transparent is its tint over a checkerboard (so "przezroczysty niebieski" stays blue).

const MULTICOLOR = 'conic-gradient(from 45deg, #e5097f 0 25%, #2b2a29 0 50%, #ffed00 0 75%, #00a0e3 0)';
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
  if (color.transparent) {
    const t = tint(color.color, 0.45);
    return `linear-gradient(${t}, ${t}), ${CHECKERBOARD}`;
  }
  return color.color || empty;
}

// a plain colour that has no hex yet (multicolour and see-through ones don't need one)
export const colorMissing = (color) => !!color && !color.multicolor && !color.transparent && !color.color;
