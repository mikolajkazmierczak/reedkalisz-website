import { get } from 'svelte/store';
import { defaults } from '%/fields/labelings';
import { labelings, companies } from '@/globals';
import { findLabeling } from '@/labelings';

function newProductLabeling(selectedCompany, apiLabeling, index, labelingID) {
  // Create a new labeling object with the given parameters.
  // The prices are calculated in +page.js
  const global_margin = selectedCompany.id === 2 ? false : true; // disabled in MidOcean
  const { width, height, label } = apiLabeling;
  const labeling = {
    ...defaults(),
    index,
    enabled: true,
    global_margin,
    labeling: labelingID,
    labeling_field_x: width,
    labeling_field_y: height,
    labeling_place: label,
  };
  delete labeling.id;
  return labeling;
}

function companyName(id) {
  return get(companies).find((c) => c.id === id)?.name ?? id;
}

export function chooseThreshold(value, thresholds) {
  // Choose the matching threshold with the highest bound, so the order of thresholds doesn't matter.
  let chosen = null;
  for (const threshold of thresholds) {
    const { threshold: v, type: t } = threshold;
    const matches = (t === 'gte' && value >= v) || (t === 'gt' && value > v);
    if (matches && (!chosen || v >= chosen.threshold)) chosen = threshold;
  }
  return chosen;
}

function resolveMapping(selectedCompany, mappings, apiCode, apiItem, area) {
  // Find the labeling to import for the given api code: either through a rule, or - if there is no
  // rule for the code - through our own labeling of that company with the very same code.
  const mapping = mappings.find((m) => m.code === apiCode);
  if (!mapping) return { company: selectedCompany.id, code: apiCode, fallback: true };

  const { type, data } = mapping;
  if (type === 'ignore') {
    console.log(`Skipping "${apiCode}" (rule says not to import it).`);
    return null;
  }
  if (type === 'direct') return { company: data.company, code: data.code };

  const value = type === 'price' ? apiItem.price : area;
  const threshold = chooseThreshold(value, data);
  if (!threshold) {
    console.warn(`No threshold for "${apiCode}" (for ${type} "${value}").`);
    return null;
  }
  return { company: threshold.company, code: threshold.code };
}

function clearDuplicates(labelings) {
  // Labelings with the same labeling (id), labeling_place and labeling_field_x/y are considered duplicates.
  const unique = new Map();
  for (const l of labelings) {
    const key = `${l.labeling}-${l.labeling_place}-${l.labeling_field_x}-${l.labeling_field_y}`;
    if (!unique.has(key)) {
      unique.set(key, l);
    }
  }
  return Array.from(unique.values());
}

export function createLabelings(selectedCompany, apiItem) {
  // Create product labelings based on the data fetched from the API, and the mapping defined above.
  // data: [{ techniques: ['CODE',...], label: 'top side', height: 0, width: 0, area: 0 }, ...]
  const productLabelings = [];
  const mappings = selectedCompany.api_labelings_mappings ?? [];

  for (const apiLabeling of apiItem._labelings) {
    const { techniques, area } = apiLabeling;

    let index = 0;
    for (const apiCode of techniques) {
      const resolved = resolveMapping(selectedCompany, mappings, apiCode, apiItem, area);
      if (!resolved) continue;

      const { company, code, fallback } = resolved;
      const labeling = findLabeling(get(labelings), company, code);
      if (!labeling) {
        const reason = fallback ? 'no rule and no labeling with the same code' : 'labeling not found';
        console.warn(`Skipping "${apiCode}" (${reason}: ${companyName(company)}/${code}).`);
        continue;
      }

      console.log(`Labeling created (${companyName(company)}/${code}${fallback ? ', by code' : ''}).`);
      productLabelings.push(newProductLabeling(selectedCompany, apiLabeling, index++, labeling.id));
    }
  }

  return clearDuplicates(productLabelings);
}
