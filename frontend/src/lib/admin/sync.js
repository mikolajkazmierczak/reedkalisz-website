// The API scanner keeps a product's labelings and categories in line with the supplier (and the mappings).
// It manages exactly what the mappings point at (labelings: or pointed at in the last scan): a labeling or category
// no mapping leads to was added by hand
// (e.g. a REED machine the supplier has nothing to map from), so it is never touched.
// These decide which is which, so the scan and the product editor always agree.

// a product of a company with an api (scanned at least once): its price, stock, name, description, sizes and
// materials follow the supplier
export const isApiCompany = (company) => !!company?.api_snapshot;

// the scanner only takes over once the company has mappings
export const syncsLabelings = (company) => !!company?.api_labelings_mappings?.length;
export const syncsCategories = (company) => !!company?.api_categories_mappings?.length;

// "company|code" of every labeling the company's labeling mappings lead to now: the rules' targets, and our labeling
// of that company with the code of every code the api uses - the import's fallback for a code without a rule, and
// the one a rule replaces (or an ignore rule drops) for a code with one.
// `codes` are the api's labeling codes, saved on the company by every scan.
export function labelingTargets(company, codes = company?.api_labelings_codes) {
  const targets = new Set();
  for (const { type, data } of company?.api_labelings_mappings ?? []) {
    if (type === 'ignore') continue;
    for (const target of [data].flat()) {
      if (target?.code) targets.add(`${target.company}|${target.code}`);
    }
  }
  for (const code of codes ?? []) targets.add(`${company.id}|${code}`);
  return targets;
}

// what the scanner manages: the labelings the mappings lead to now, and the ones the last scan led to (saved on the
// company by every scan) - so the next scan takes off a labeling a changed rule no longer leads to, or one of a code
// gone from the api, instead of leaving it on the products for good
export const mappedLabelings = (company, codes) =>
  new Set([...labelingTargets(company, codes), ...(company?.api_labelings_targets ?? [])]);

export function isManagedLabeling(productLabeling, labelings, company, targets = mappedLabelings(company)) {
  const labeling = (labelings ?? []).find((l) => l.id === productLabeling.labeling);
  return !!labeling && targets.has(`${labeling.company}|${labeling.code}`);
}

// ids of every category the company's category mappings lead to
export function mappedCategories(company) {
  return new Set((company?.api_categories_mappings ?? []).flatMap((m) => m.categories ?? []));
}

export const isManagedCategory = (productCategory, company, targets = mappedCategories(company)) =>
  targets.has(productCategory.category);
