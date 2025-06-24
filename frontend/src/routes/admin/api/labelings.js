import { defaults } from '%/fields/labelings';
import { companies, labelings } from '@/globals';

// the map points to a company and a code
const tempMapping = {
  P1: 'REED:RT1',
  P2: 'REED:RT1',
  P3: 'MidOcean:P3',
  L2: {
    price: {
      x: 'REED:L1',
      '>3': 'REED:L2',
      '>5': 'REED:L3'
    }
  },
  L3: {
    area: {
      x: 'REED:L3',
      '>5': 'REED:L4',
      '>10': 'REED:L5',
      '>30': 'MidOcean:L3'
    }
  }
};

function parseMapping(mapping) {
  // parse the mapping to a more usable format
  const parseCode = code => {
    const parts = code.split(':');
    const company = companies.find(c => c.name === parts[0]).id;
    return { company, code: parts[1] };
  };
  const parseArea = area => {
    for (const key in area) {
      const value = area[key];
      const props =
        key === 'x'
          ? { type: 'default' }
          : key.startsWith('>')
            ? { type: 'gt', threshold: parseFloat(key.slice(1)) }
            : key.startsWith('>=')
              ? { type: 'gte', threshold: parseFloat(key.slice(2)) }
              : key.startsWith('<')
                ? { type: 'lt', threshold: parseFloat(key.slice(1)) }
                : key.startsWith('<=') || key === 'default'
                  ? { type: 'lte', threshold: parseFloat(key.slice(2)) }
                  : {};
      return props;
    }
  };
  const result = {};
  for (const key in mapping) {
    const value = mapping[key];
    if (typeof value === 'string') {
      result[key] = parseCode(value);
    } else {
      result[key] = parseMapping(value);
    }
  }
  return result;
}

export function getLabelings(data) {
  // get labeling id based on the company and code
  const output = [];
  for (const labeling of data) {
    const { techniques, label, height, width, area } = labeling;
    for (const technique of techniques) {
      const mapping = tempMap[technique];
      // ...
    }
  }
}
