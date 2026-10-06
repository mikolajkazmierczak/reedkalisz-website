import { findLabeling } from '@/labelings';
import { apiPaths, pathState } from './categories.js';
import { resolveMapping } from './labelings.js';

// What an API product will be missing once imported (or scanned), from the company's mappings - the "Komplikacje" column:
//   labelings: the ones that won't be imported (no rule and no labeling of ours with its code, a rule to a labeling we
//              don't have, a price or area no threshold covers) - "ignoruj" rules leave one out on purpose
//   unmapped:  the supplier's categories that give it none of ours without meaning to (no rule, or a rule to categories
//              since deleted; see pathState)
//   noPrice:   no price from the supplier (none, or prices by the amount, see Promotionway) - the site shows
//              "Zapytaj o cenę"; only while the supplier gives prices at all (USBSystem gives none)
//   ignored:   the ones that give it none on purpose ("ignoruj", its own or from above)
//   noCategory: in none of the supplier's categories, "BEZ KATEGORII" not mapped to one of ours (see pathState)
// the categories only while the supplier has categories at all; `withCategories` and `withPrices` from scanScope
// -> { labelings: [code], unmapped: [text], noPrice: bool, ignored: [text], noCategory: bool }, or null when nothing is
// missing
export function itemHealth(company, apiItem, { labelings, index, withCategories, withPrices }) {
  if (!company || !apiItem) return null;
  const mappings = company.api_categories_mappings;
  const health = {
    labelings: [...lostLabelings(company, company.api_labelings_mappings ?? [], apiItem, labelings)],
    unmapped: [],
    noPrice: withPrices && apiItem.price == null,
    ignored: [],
    noCategory: false,
  };
  if (withCategories) {
    for (const path of apiPaths(apiItem._categories)) {
      const state = pathState(mappings, path, index);
      if (state === 'mapped') continue;
      if (!path.length && state === 'ignored') health.noCategory = true;
      else health[state].push(path.length ? path.join(' › ') : 'BEZ KATEGORII');
    }
  }
  return healthLevel(health) ? health : null;
}

// what the supplier's scan has at all: categories, prices
export const scanScope = (apiItems) => ({
  withCategories: (apiItems ?? []).some((i) => i._categories?.length),
  withPrices: (apiItems ?? []).some((i) => i.price != null),
});

// the one mark a product gets, the first of: 'labelings' (calculator), 'unmapped' (tag), 'noPrice' (money), 'ignored'
// (yellow dot: ignored categories, or none of the supplier's); for sorting too
const marks = {
  labelings: (h) => h.labelings.length,
  unmapped: (h) => h.unmapped.length,
  noPrice: (h) => h.noPrice,
  ignored: (h) => h.ignored.length || h.noCategory,
};
export const healthLevels = Object.keys(marks);
export const healthLevel = (health) => (health && healthLevels.find((key) => marks[key](health))) || null;

// a product's labeling codes that won't be imported with these rules ("ignoruj" ones leave a code out on purpose)
export function lostLabelings(company, rules, apiItem, labelings) {
  const lost = new Set();
  for (const { techniques = [], area } of apiItem._labelings ?? []) {
    for (const code of techniques) {
      if (rules.find((r) => r.code === code)?.type === 'ignore') continue;
      const resolved = resolveMapping(company, rules, code, apiItem, area, () => {});
      if (!resolved || !findLabeling(labelings, resolved.company, resolved.code)) lost.add(code);
    }
  }
  return lost;
}

// each product's level, for sorting by it (`item._scan`: the scan's product, see items.js merge) -> item -> level
export function complicationsOf(company, apiItems, labelings, index) {
  const scope = scanScope(apiItems);
  const levels = new Map();
  return (item) => {
    if (!item._scan) return null;
    if (!levels.has(item._scan))
      levels.set(item._scan, healthLevel(itemHealth(company, item._scan, { labelings, index, ...scope })));
    return levels.get(item._scan);
  };
}
