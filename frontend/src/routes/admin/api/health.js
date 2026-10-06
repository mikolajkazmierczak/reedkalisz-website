import { findLabeling } from '@/labelings';
import { apiPaths, mappingAt, resolveCategories } from './categories.js';
import { resolveMapping } from './labelings.js';

// What an API product will be missing once imported (or scanned), from the company's mappings - the "Komplikacje" column:
//   labelings: the ones that won't be imported (no rule and no labeling of ours with its code, a rule to a labeling we
//              don't have, a price or area no threshold covers) - "ignoruj" rules leave one out on purpose
//   unmapped:  the supplier's categories that give it none of ours without meaning to (no rule, or a rule to categories
//              since deleted)
//   noPrice:   no price from the supplier (none, or prices by the amount, see Promotionway) - the site shows
//              "Zapytaj o cenę"; only while the supplier gives prices at all (USBSystem gives none)
//   ignored:   the ones that give it none on purpose ("ignoruj", its own or from above)
// the categories only while the supplier has categories at all ("BEZ KATEGORII": a product in none of theirs);
// `withCategories` and `withPrices` from scanScope
// -> { labelings: [code], unmapped: [text], noPrice: bool, ignored: [text] }, or null when nothing is missing
export function itemHealth(company, apiItem, { labelings, index, withCategories, withPrices }) {
  if (!company || !apiItem) return null;
  const mappings = company.api_categories_mappings;
  const health = {
    labelings: [...lostLabelings(company, company.api_labelings_mappings ?? [], apiItem, labelings)],
    unmapped: [],
    noPrice: withPrices && apiItem.price == null,
    ignored: [],
  };
  if (withCategories) {
    for (const path of apiPaths(apiItem._categories)) {
      if (resolveCategories(mappings, [path], index).length) continue;
      const name = path.length ? path.join(' › ') : 'BEZ KATEGORII';
      health[mappingAt(mappings, path)?.length === 0 ? 'ignored' : 'unmapped'].push(name);
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
// (yellow dot); for sorting too
export const healthLevels = ['labelings', 'unmapped', 'noPrice', 'ignored'];
const has = (value) => (Array.isArray(value) ? value.length > 0 : !!value);
export const healthLevel = (health) => healthLevels.find((key) => has(health?.[key])) ?? null;

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
