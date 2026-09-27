// The API scanner keeps a product's labelings and categories in line with the supplier (and the mappings).
// It manages exactly what the mappings point at: a labeling or category no mapping leads to was added by hand
// (e.g. a REED machine the supplier has nothing to map from), so it is never touched.
// These decide which is which, so the scan and the product editor always agree.

// a product of a company with an api (scanned at least once): its price, stock, name, description, sizes and
// materials follow the supplier
export const isApiCompany = (company) => !!company?.api_snapshot;

// the scanner only takes over once the company has mappings
export const syncsLabelings = (company) => !!company?.api_labelings_mappings?.length;
export const syncsCategories = (company) => !!company?.api_categories_mappings?.length;

// "company|code" of every labeling the company's labeling mappings lead to: the rules' targets, and - for the
// codes the api uses without a rule - our labeling of that company with the very same code (the import's fallback).
// `codes` are the api's labeling codes, saved on the company by every scan.
export function mappedLabelings(company, codes = company?.api_labelings_codes) {
  const targets = new Set();
  const ruled = new Set();
  for (const { code, type, data } of company?.api_labelings_mappings ?? []) {
    ruled.add(code);
    if (type === 'ignore') continue;
    for (const target of [data].flat()) {
      if (target?.code) targets.add(`${target.company}|${target.code}`);
    }
  }
  for (const code of codes ?? []) if (!ruled.has(code)) targets.add(`${company.id}|${code}`);
  return targets;
}

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
