// Formats a labeling for selects: "REED · L1 · Laser (1 miejsce)" (company name is optional).
export function labelingText({ code, name, type }, companyName = null) {
  const theType = type ? ` (${type})` : '';
  const parts = [companyName, code || '-', name ? `${name}${theType}` : type || '-'];
  return parts.filter(Boolean).join(' · ');
}

// A company's default labeling: the first in its calculations (they're ordered there, the first one is the default).
// `withCode` leaves out the ones without a code (a mapping rule needs one).
export function defaultLabeling(labelings, company, { withCode = true } = {}) {
  const own = (labelings ?? []).filter((l) => l.company === company && (!withCode || l.code));
  return own.sort((a, b) => a.index - b.index)[0] ?? null;
}

// A labeling of the given company with the given code, if we have one.
// Used both to validate mappings and as their fallback (see `createLabelings`).
export function findLabeling(labelings, company, code) {
  if (!code) return null;
  return (labelings ?? []).find((l) => l.company === company && l.code === code) ?? null;
}
