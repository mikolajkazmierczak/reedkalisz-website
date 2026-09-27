// Labeling places come from the supplier as they are ("FRONT", "SIDE 2", "BARREL LEFT HANDED"),
// and we show them in Polish. A company's place mappings translate them:
//   [{ pattern: 'FRONT', to: 'przód' }, { pattern: 'FRONT POCKET', to: 'kieszeń - przód' }]
// A rule matches a place that contains its words ("FRONT" matches "FRONT UPPER", not "FRONTAL"), and then the whole
// place becomes its translation. When several rules match, the most specific one - the longest - wins, so the order
// of the rules doesn't matter. Case is ignored.

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const compiled = new Map(); // a scan translates thousands of places

function compileRule({ pattern }) {
  // -> RegExp, or null for an empty rule
  const words = pattern?.trim();
  if (!words) return null;
  if (!compiled.has(words)) {
    // whole words only: letters and digits around the match don't count, so "SIDE" doesn't match "INSIDE"
    compiled.set(words, new RegExp(`(?<![\\p{L}\\p{N}])${escape(words)}(?![\\p{L}\\p{N}])`, 'iu'));
  }
  return compiled.get(words);
}

// The rule that translates a place: the longest one it contains. -> rule or null
export function matchRule(mappings, place) {
  let best = null;
  for (const rule of mappings ?? []) {
    const re = compileRule(rule);
    if (!re || !rule.to?.trim() || !re.test(place)) continue; // a rule without a translation does nothing yet
    if (!best || rule.pattern.trim().length > best.pattern.trim().length) best = rule;
  }
  return best;
}

// every place the api uses, with how often, the most frequent first
export function placeCounts(apiItems) {
  const counts = new Map();
  for (const item of apiItems ?? []) {
    for (const { label } of item._labelings ?? []) {
      const place = (label ?? '').trim();
      if (place) counts.set(place, (counts.get(place) ?? 0) + 1);
    }
  }
  return [...counts].map(([place, count]) => ({ place, count })).sort((a, b) => b.count - a.count);
}

// how many places each rule translates (the ones it wins): rule -> count
export function countHits(rules, places) {
  const hits = new Map();
  for (const { place } of places) {
    const rule = matchRule(rules, place);
    if (rule) hits.set(rule, (hits.get(rule) ?? 0) + 1);
  }
  return hits;
}

export function translatePlace(mappings, place) {
  const text = (place ?? '').trim();
  const rule = matchRule(mappings, text);
  return rule ? rule.to.replace(/\s+/g, ' ').trim() : text;
}

// Places of the same labeling with the same field size are one labeling: "przód / tył".
export const joinPlaces = (places) => {
  const unique = [];
  for (const p of places.map((p) => (p ?? '').trim()).filter(Boolean)) {
    if (!unique.some((u) => u.toLowerCase() === p.toLowerCase())) unique.push(p);
  }
  return unique.join(' / ');
};
