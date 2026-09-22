import { defaultLabeling } from '@/labelings';

// What a freshly added rule (or threshold) points at, so it is never in an unpicked state.
export function newTarget(apiCompany, labelings) {
  const labeling = defaultLabeling(labelings, apiCompany.id);
  return { company: labeling?.company ?? apiCompany.id, code: labeling?.code ?? '' };
}
