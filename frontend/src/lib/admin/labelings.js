// Formats a labeling for selects: "REED · L1 · Laser (1 miejsce)" (company name is optional).
export function labelingText({ code, name, type }, companyName = null) {
  const theType = type ? ` (${type})` : '';
  const parts = [companyName, code || '-', name ? `${name}${theType}` : type || '-'];
  return parts.filter(Boolean).join(' · ');
}

// What a new rule points at before anything is picked: the company's default labeling, or its first.
export function defaultLabeling(labelings, company) {
  const own = (labelings ?? []).filter((l) => l.company === company && l.code);
  return own.find((l) => l.default) ?? own[0] ?? null;
}

// A labeling of the given company with the given code, if we have one.
// Used both to validate mappings and as their fallback (see `createLabelings`).
export function findLabeling(labelings, company, code) {
  if (!code) return null;
  return (labelings ?? []).find((l) => l.company === company && l.code === code) ?? null;
}
