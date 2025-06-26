import { get } from 'svelte/store';
import { defaults } from '%/fields/labelings';
import { labelings } from '@/globals';

// the map points to a company and a code
const mapping = {
  P1: { company: 4, code: 'RT1' },
  P2: { company: 4, code: 'RT1' },
  P3: { company: 2, code: 'P3' },
  P4: { company: 2, code: 'P4' },
  P5: { company: 2, code: 'P5' },
  P6: { company: 2, code: 'P6' },
  P7: { company: 2, code: 'P7' },
  S1: { company: 2, code: 'S1' },
  S2: { company: 2, code: 'S2' },
  S3: { company: 2, code: 'S3' },
  S4: { company: 2, code: 'S4' },
  S5: { company: 2, code: 'S5' },
  S6: { company: 2, code: 'S6' },
  S7: { company: 2, code: 'S7' },
  RS1: { company: 2, code: 'RS1' },
  RS2: { company: 2, code: 'RS2' },
  RS3: { company: 2, code: 'RS3' },
  RS4: { company: 2, code: 'RS4' },
  RS5: { company: 2, code: 'RS5' },
  RS6: { company: 2, code: 'RS6' },
  RS7: { company: 2, code: 'RS7' },
  L2: {
    criteria: 'price',
    thresholds: [
      { company: 4, code: 'L1', value: 0, type: 'gte' },
      { company: 4, code: 'L2', value: 3, type: 'gt' },
      { company: 4, code: 'L3', value: 5, type: 'gt' }
    ]
  },
  L3: {
    criteria: 'area', // area in mm^2
    thresholds: [
      { company: 4, code: 'L3', value: 0, type: 'gte' },
      { company: 4, code: 'L4', value: 500, type: 'gt' },
      { company: 4, code: 'L5', value: 1000, type: 'gt' },
      { company: 2, code: 'L3', value: 3000, type: 'gt' }
    ]
  },
  L4: {
    criteria: 'area', // area in mm^2
    thresholds: [
      { company: 4, code: 'L3', value: 0, type: 'gte' },
      { company: 4, code: 'L4', value: 500, type: 'gt' },
      { company: 4, code: 'L5', value: 1000, type: 'gt' },
      { company: 2, code: 'L3', value: 3000, type: 'gt' }
    ]
  },
  L5: {
    criteria: 'area', // area in mm^2
    thresholds: [
      { company: 4, code: 'L3', value: 0, type: 'gte' },
      { company: 4, code: 'L4', value: 500, type: 'gt' },
      { company: 4, code: 'L5', value: 1000, type: 'gt' },
      { company: 2, code: 'L3', value: 3000, type: 'gt' }
    ]
  },
  L6: {
    criteria: 'area', // area in mm^2
    thresholds: [
      { company: 4, code: 'L3', value: 0, type: 'gte' },
      { company: 4, code: 'L4', value: 500, type: 'gt' },
      { company: 4, code: 'L5', value: 1000, type: 'gt' },
      { company: 2, code: 'L3', value: 3000, type: 'gt' }
    ]
  },
  L7: {
    criteria: 'area', // area in mm^2
    thresholds: [
      { company: 4, code: 'L3', value: 0, type: 'gte' },
      { company: 4, code: 'L4', value: 500, type: 'gt' },
      { company: 4, code: 'L5', value: 1000, type: 'gt' },
      { company: 2, code: 'L3', value: 3000, type: 'gt' }
    ]
  },
  RD1: { company: 2, code: 'RD1' },
  RD2: { company: 2, code: 'RD2' },
  RD3: { company: 2, code: 'RD3' },
  RL: {
    criteria: 'area',
    thresholds: [
      { company: 4, code: 'L5', value: 0, type: 'gte' },
      { company: 4, code: 'L6', value: 1500, type: 'gt' },
      { company: 2, code: 'RL', value: 3000, type: 'gt' }
    ]
  },
  TD1: {
    criteria: 'area',
    thresholds: [
      { company: 4, code: 'TD1/A', value: 0, type: 'gte' },
      { company: 4, code: 'TD1/B', value: 5000, type: 'gt' },
      { company: 4, code: 'TD1/C', value: 15000, type: 'gt' },
      { company: 4, code: 'TD1/D', value: 30000, type: 'gt' },
      { company: 2, code: 'TD1', value: 99900, type: 'gt' }
    ]
  }
};

function newProductLabeling(company, apiLabeling, index, labelingID) {
  // Create a new labeling object with the given parameters.
  // The prices are calculated in +page.js
  const global_margin = company === 2 ? false : true; // disabled in MidOcean
  const { width, height, label } = apiLabeling;
  return {
    ...defaults(),
    index,
    enabled: true,
    global_margin,
    labeling: labelingID,
    labeling_field_x: width,
    labeling_field_y: height,
    labeling_place: label
  };
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
    const { value: v, type: t } = threshold;
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

export function createLabelings(companyData, apiItem) {
  // Create product labelings based on the data fetched from the API, and the mapping defined above.
  // data: [{ techniques: ['CODE',...], label: 'top side', height: 0, width: 0, area: 0 }, ...]
  const productLabelings = [];
  const mappings = companyData.api_labelings_mapping;
  if (!mappings) {
    console.warn('No labelings mapping found for the company.');
    return productLabelings;
  }

  for (const apiLabeling of apiItem._labelings) {
    const { techniques, area } = apiLabeling;

    let index = 0;
    for (const technique of techniques) {
      if (!mappings[technique]) {
        console.warn(`Labeling code "${technique}" not found in mapping.`);
        continue;
      }

      let company, code;
      const rule = mappings[technique];
      if (!rule.criteria) {
        // direct case: company and code are defined directly
        ({ company, code } = rule);
      } else if (rule.criteria === 'price') {
        // price-based case: company and code are defined based on thresholds
        const threshold = chooseThreshold(item.price, rule.thresholds);
        if (!threshold) {
          console.warn(`No threshold for price "${item.price}" for "${technique}".`);
          continue;
        }
        ({ company, code } = threshold);
      } else if (rule.criteria === 'area') {
        // area-based case: company and code are defined based on thresholds
        const threshold = chooseThreshold(area, rule.thresholds);
        if (!threshold) {
          console.warn(`No threshold for area "${area}" for "${technique}".`);
          continue;
        }
        ({ company, code } = threshold);
      }

      const labeling = findLabeling(company, code);
      if (!labeling) {
        console.warn(`Labeling with company "${company.name}" and code "${code}" not found.`);
        continue;
      }

      productLabelings.push(newProductLabeling(company, apiLabeling, index++, labeling.id));
    }
  }

  return clearDuplicates(productLabelings);
}
