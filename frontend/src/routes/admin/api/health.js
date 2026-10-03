import { findLabeling } from '@/labelings';
import { resolveCategories } from './categories.js';
import { resolveMapping } from './labelings.js';
import { matchRule } from './places.js';

// What an API product will be missing once imported (or scanned), from the company's mappings - the "Komplikacje" column:
//   red:    a labeling that won't be imported (no rule and no labeling of ours with its code, a rule to a labeling we
//           don't have, a price or area no threshold covers) - "ignoruj" rules leave one out on purpose
//   orange: none of our categories (while the supplier has categories), a place no place rule translates (once the
//           company has place rules: a supplier writing in Polish needs none)
// -> { level: 'red' | 'orange', notes: [text] }, or null when nothing is missing
export function itemHealth(company, apiItem, { labelings, index, withCategories }) {
  if (!company || !apiItem) return null;
  const red = [];
  const orange = [];

  const rules = company.api_labelings_mappings ?? [];
  const lost = new Set();
  for (const { techniques = [], area } of apiItem._labelings ?? []) {
    for (const code of techniques) {
      if (rules.find((r) => r.code === code)?.type === 'ignore') continue;
      const resolved = resolveMapping(company, rules, code, apiItem, area, () => {});
      if (!resolved || !findLabeling(labelings, resolved.company, resolved.code)) lost.add(code);
    }
  }
  if (lost.size) red.push(`Znakowania, które się nie zaimportują: ${[...lost].join(', ')}`);

  if (withCategories && !resolveCategories(company.api_categories_mappings, apiItem._categories, index).length) {
    orange.push('Nie dostanie żadnej kategorii');
  }

  const places = company.api_places_mappings ?? [];
  if (places.length) {
    const untranslated = new Set(
      (apiItem._labelings ?? []).map((l) => (l.label ?? '').trim()).filter((p) => p && !matchRule(places, p)),
    );
    if (untranslated.size) orange.push(`Miejsca bez tłumaczenia: ${[...untranslated].join(', ')}`);
  }

  if (red.length) return { level: 'red', notes: [...red, ...orange] };
  if (orange.length) return { level: 'orange', notes: orange };
  return null;
}

// each product's level, for sorting by it (`item._scan`: the scan's product, see items.js merge) -> item -> level
export function complicationsOf(company, apiItems, labelings, index) {
  const withCategories = (apiItems ?? []).some((i) => i._categories?.length);
  const levels = new Map();
  return (item) => {
    if (!item._scan) return null;
    if (!levels.has(item._scan))
      levels.set(item._scan, itemHealth(company, item._scan, { labelings, index, withCategories })?.level ?? null);
    return levels.get(item._scan);
  };
}
