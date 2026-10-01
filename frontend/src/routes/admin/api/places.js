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

// a rule's translation as it's shown and compared (its spaces tidied)
export const normal = (to) => to.replace(/\s+/g, ' ').trim();

// the places each rule translates (the ones it wins): rule -> [place] - matched once, for the counts and the useless
// rules alike (a page of rules does it on every keystroke)
export function placeWins(rules, places) {
  const wins = new Map();
  for (const { place } of places) {
    const rule = matchRule(rules, place);
    if (rule) (wins.get(rule) ?? wins.set(rule, []).get(rule)).push(place);
  }
  return wins;
}

// how many places each rule translates: rule -> count
export const countHits = (wins) => new Map([...wins].map(([rule, won]) => [rule, won.length]));

// The rules that change nothing: every place they translate would come out the same without them - left as the api
// has it ("przód" -> "przód"), or translated the same by a shorter rule ("Lewy bok" -> "bok" next to "Bok" -> "bok":
// "Bok" is a word of "Lewy bok" too). (A rule keeping a place as it is, so a shorter one doesn't change it, isn't one
// of them; nor is a rule translating no place: it's counted as matching nothing.)
// -> Map(rule -> what does the same instead: [the one rule], [] when the places would just stay as they are, or
// null when that's several rules - or some rule and some places left as they are)
export function uselessRules(rules, wins) {
  const useless = new Map();
  for (const [rule, won] of wins) {
    const others = rules.filter((r) => r !== rule);
    const same = (place) => !tied(others, place) && translatePlace(others, place) === normal(rule.to);
    if (!won.every(same)) continue;
    const instead = new Set(won.map((place) => matchRule(others, place)));
    useless.set(rule, instead.size > 1 ? null : [...instead].filter(Boolean));
  }
  return useless;
}

// Whether the longest rules a place matches are several, translating it differently: which one wins then depends on
// their order (and the order changes - the page sorts them by how much they translate). A rule settling that (a longer
// one, for exactly that place) is needed, even when the rule winning now says the same.
function tied(rules, place) {
  let length = 0;
  let results = new Set();
  for (const rule of rules ?? []) {
    const re = compileRule(rule);
    if (!re || !rule.to?.trim() || !re.test(place)) continue;
    const l = rule.pattern.trim().length;
    if (l > length) {
      length = l;
      results = new Set();
    }
    if (l === length) results.add(normal(rule.to));
  }
  return results.size > 1;
}

export function translatePlace(mappings, place) {
  const text = (place ?? '').trim();
  const rule = matchRule(mappings, text);
  return rule ? normal(rule.to) : text;
}

// Places of the same labeling with the same field size are one labeling: "przód / tył".
export const joinPlaces = (places) => {
  const unique = [];
  for (const p of places.map((p) => (p ?? '').trim()).filter(Boolean)) {
    if (!unique.some((u) => u.toLowerCase() === p.toLowerCase())) unique.push(p);
  }
  return unique.join(' / ');
};
