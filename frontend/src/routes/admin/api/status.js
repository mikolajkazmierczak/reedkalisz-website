import { categoryIndex } from '@/categories';
import { findLabeling } from '@/labelings';
import { apiPaths, listApiCategories, pathKey, pathState } from './categories.js';
import { hasPrintData, labelingCodes } from './company.js';
import { placeCounts, placeWins, uselessRules as uselessPlaceRules } from './places.js';
import { retiredOf } from './items.js';

// What's left to do in the API tabs, from a company's saved mappings, its last scan and our products. The tabs show it
// in the header (see apiTabs), the mapping pages next to the rules. What will be missing on the products (labelings
// nothing imports, categories that lead nowhere) comes first, then what to tidy up (rules that do nothing).
// -> [{ label, count }, ...] (the count bold after the label), or null when there's nothing

function status(counts) {
  const notes = counts.filter(([, n]) => n).map(([label, count]) => ({ label, count }));
  return notes.length ? notes : null;
}

const repeats = (list) => new Set(list.filter((x, i) => list.indexOf(x) !== i)).size;

// products

// what we have that the supplier no longer does, as Produkty counts it (its "Wycofany" tags, its Posprzątaj)
function productsStatus(company, dbItems, apiItems) {
  if (!dbItems) return null;
  const { products, variants } = retiredOf(company, dbItems, apiItems);
  return status([
    ['Produkty wycofane z API', products.length],
    ['Warianty wycofane z API', variants.length],
  ]);
}

// labelings

const ruleTargets = (rule) => (rule.type === 'ignore' ? [] : Array.isArray(rule.data) ? rule.data : [rule.data]);

// the api codes nothing imports: no rule, and no labeling of the company with the very same code
export function lostCodes(apiCodes, rules, labelings, companyId) {
  const ruled = new Set(rules.map((r) => r.code));
  return apiCodes.filter((code) => !ruled.has(code) && !findLabeling(labelings, companyId, code));
}

// a rule's targets we don't have (an unset one is not one yet: the rule was just added)
export const missingTargets = (rule, labelings) =>
  ruleTargets(rule).filter((t) => t?.code && !findLabeling(labelings, t.company, t.code));

// a rule pointing at the company's labeling with the very same code does what the import does on its own
function uselessRule(rule, companyId) {
  const targets = ruleTargets(rule);
  return targets.length > 0 && targets.every((t) => t?.company === companyId && t.code === rule.code);
}

// the rules the import doesn't need (see uselessRule) - none while no other working rule is left: without any rule
// the scanner stops keeping the company's labelings and places in sync
export function uselessRules(rules, apiCodes, labelings, companyId) {
  const live = rules.filter((r) => apiCodes.includes(r.code));
  const useless = live.filter((r) => !missingTargets(r, labelings).length && uselessRule(r, companyId));
  return live.length > useless.length ? useless : [];
}

function labelingsStatus(company, apiItems, labelings) {
  if (!hasPrintData(apiItems)) return null;
  const apiCodes = labelingCodes(apiItems);
  const rules = company.api_labelings_mappings ?? [];
  const live = rules.filter((r) => apiCodes.includes(r.code)); // the others never run
  return status([
    ['Znakowania bez mapowań', lostCodes(apiCodes, rules, labelings, company.id).length],
    ['Reguły prowadzące do znakowań, których nie mamy', live.filter((r) => missingTargets(r, labelings).length).length],
    ['Reguły kodów, których nie ma w API', rules.length - live.length],
    ['Zbędne reguły', uselessRules(rules, apiCodes, labelings, company.id).length],
    ['Powtórzone kody', repeats(rules.map((r) => r.code))],
  ]);
}

// categories

// the mappings of categories the supplier no longer has (`nodes` from listApiCategories)
export function staleMappings(mappings, nodes) {
  const keys = new Set(nodes.map((n) => pathKey(n.path)));
  return mappings.filter((m) => !keys.has(pathKey(m.path)));
}

// the supplier's categories (as products sit in them) that give their products none of ours without meaning to (see
// pathState: "ignoruj" and "BEZ KATEGORII" without a mapping do on purpose) -> [path]
export function unmappedPaths(mappings, apiItems, index) {
  const paths = new Map();
  for (const item of apiItems ?? []) {
    for (const path of apiPaths(item._categories)) {
      if (pathState(mappings, path, index) === 'unmapped') paths.set(pathKey(path), path);
    }
  }
  return [...paths.values()];
}

function categoriesStatus(company, apiItems, categories) {
  if (!(apiItems ?? []).some((i) => i._categories?.length)) return null;
  const mappings = company.api_categories_mappings ?? [];
  const index = categoryIndex(categories);
  const stale = staleMappings(mappings, listApiCategories(apiItems));
  const deleted = (m) => (m.categories ?? []).some((id) => !index.existing.has(id));
  return status([
    ['Kategorie bez mapowań', unmappedPaths(mappings, apiItems, index).length],
    ['Mapowania do usuniętych kategorii', mappings.filter((m) => !stale.includes(m) && deleted(m)).length],
    ['Mapowania kategorii, których nie ma w API', stale.length],
  ]);
}

// places

function placesStatus(company, apiItems) {
  if (!hasPrintData(apiItems)) return null;
  const rules = company.api_places_mappings ?? [];
  const places = placeCounts(apiItems);
  const wins = placeWins(rules, places);
  return status([
    ['Reguły, które niczego nie tłumaczą', rules.filter((r) => r.pattern?.trim() && !wins.has(r)).length],
    ['Zbędne reguły', uselessPlaceRules(rules, wins).size],
  ]);
}

// the tabs' statuses by their path
export const tabStatuses = (company, apiItems, labelings, categories, dbItems) => ({
  '/admin/api/produkty': productsStatus(company, dbItems, apiItems),
  '/admin/api/znakowania': labelingsStatus(company, apiItems, labelings),
  '/admin/api/kategorie': categoriesStatus(company, apiItems, categories),
  '/admin/api/miejsca': placesStatus(company, apiItems),
});
