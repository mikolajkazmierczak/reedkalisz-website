import { get } from 'svelte/store';
import { colors } from '@/globals';
import { slugify } from '%/utils';

export function round(num) {
  // round to two decimal places
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function findColor(color) {
  return typeof color == 'string'
    ? get(colors).find(c => slugify(c.name) == slugify(color))
    : get(colors).find(c => c.id == color);
}
export function findColorId(str) {
  if (!str) return null;
  return findColor(str)?.id || null;
}

function parseColor(color) {
  // color: id or name (int or string)
  // find a color in $colors by id or by comparing slugified names - if not found return `[NOWY] query`
  if (!color) return null;
  return findColor(color)?.name || `[NOWY] ${color}`;
}
export function parseColors(color1, color2) {
  if (!color1 && !color2) return '[BRAK]';
  return [color1, color2]
    .map(c => parseColor(c))
    .filter(Boolean)
    .join(' / ');
}

export function getFlag(flags, uid) {
  return Object.entries(flags).find(([key, { items }]) => items?.includes(uid))?.[0] || '_default';
}
