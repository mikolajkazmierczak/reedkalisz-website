import { get } from 'svelte/store';
import { defaults } from '%/fields/labelings';
import { labelings, companies } from '@/globals';

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
    labeling_place: label
  };
  delete labeling.id;
  return labeling;
}

function findLabeling(company, code) {
  const labeling = get(labelings).find(l => l.company === company && l.code === code);
  if (labeling) return labeling;
  console.warn(`Labeling with company ${company} and code ${code} not found.`);
}

function chooseThreshold(value, thresholds) {
  // Choose the appropriate threshold based on the value and the defined thresholds.
  let chosen = null;
  for (const threshold of thresholds) {
    const { threshold: v, type: t } = threshold;
    if ((t === 'gte' && value >= v) || (t === 'gt' && value > v)) {
      chosen = threshold;
    }
  }
  return chosen;
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
  const mappings = selectedCompany.api_labelings_mappings;
  if (!mappings) {
    console.warn('No labelings mappings found for the company.');
    return productLabelings;
  }

  for (const apiLabeling of apiItem._labelings) {
    const { techniques, area } = apiLabeling;

    let index = 0;
    for (const apiCode of techniques) {
      const mapping = mappings.find(m => m.code === apiCode);
      if (!mapping) {
        console.warn(`No mapping for "${apiCode}".`);
        continue;
      }

      let company, code;
      const { type, data } = mapping;
      if (type === 'direct') {
        ({ company, code } = data);
      } else if (type === 'price') {
        const threshold = chooseThreshold(apiItem.price, data);
        if (!threshold) {
          console.warn(`No threshold for "${apiCode}" (for price "${item.price}").`);
          continue;
        }
        ({ company, code } = threshold);
      } else if (type === 'area') {
        const threshold = chooseThreshold(area, data);
        if (!threshold) {
          console.warn(`No threshold for "${apiCode}" (for area "${area}").`);
          continue;
        }
        ({ company, code } = threshold);
      }

      const companyName = get(companies).find(c => c.id === company)?.name;

      const labeling = findLabeling(company, code);
      if (!labeling) {
        console.warn(`Labeling ${companyName}/${code} not found.`);
        continue;
      }

      console.log(`Labeling created (${companyName}/${code}).`);
      productLabelings.push(newProductLabeling(selectedCompany, apiLabeling, index++, labeling.id));
    }
  }

  return clearDuplicates(productLabelings);
}
