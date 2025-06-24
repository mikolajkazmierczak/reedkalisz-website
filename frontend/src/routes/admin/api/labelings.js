import { get } from 'svelte/store';
import { defaults } from '%/fields/labelings';
import { companies, labelings } from '@/globals';

// the map points to a company and a code
const mapping = {
  P1: { company: 4, code: 'RT1' },
  P2: { company: 4, code: 'RT1' },
  P3: { company: 2, code: 'P3' },
  L2: {
    threshold: 'price',
    values: [
      { company: 4, code: 'L1', value: null, type: 'eq' },
      { company: 4, code: 'L2', value: 3, type: 'gt' },
      { company: 4, code: 'L3', value: 5, type: 'gt' }
    ]
  },
  L3: {
    threshold: 'area', // area in mm^2
    values: [
      { company: 4, code: 'L3', value: null, type: 'gt' },
      { company: 4, code: 'L4', value: 50, type: 'gt' },
      { company: 4, code: 'L5', value: 100, type: 'gt' },
      { company: 2, code: 'L3', value: 300, type: 'gt' }
    ]
  }
};

function newLabeling(company, id, index, label, height, width) {
  // TODO: should the price calculation be done here? or after the item is created in +page.js?
  // Create a new labeling object with the given parameters.
  const global_margin = company === 2 ? false : true; // disabled in MidOcean
  return {
    index,
    enabled: true, // enabled by default?
    global_margin,
    labeling: id,
    labeling_field_x: width,
    labeling_field_y: height,
    labeling_place: label
  };
}

export function createLabelings(data) {
  // Create product labelings based on the data fetched from the API, and the mapping defined above.
  // data: [{ techniques: ['CODE',...], label: 'top side', height: 0, width: 0, area: 0 }, ...]
  const result = [];

  for (const labeling of data) {
    const { techniques, label, height, width, area } = labeling;
    for (const technique of techniques) {
      if (!mapping[technique]) {
        console.warn(`Labeling code ${technique} not found in mapping.`);
        continue;
      }

      let index = 0;

      const rule = mapping[technique];
      if (rule.code) {
        // Simple case: company and code are defined directly
        // Only need to check if the labeling with such company and code exists.
        const { company, code } = rule;
        const l = get(labelings).find(l => l.company === company && l.code === code);
        result.push(newLabeling(company, l?.id, index++, label, height, width));
      }
    }
  }
}
