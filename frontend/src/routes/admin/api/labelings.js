import { get } from 'svelte/store';
import { labelings, companies } from '@/globals';
import { findLabeling } from '@/labelings';
import { isManagedLabeling, mappedLabelings } from '@/sync';
import { joinPlaces, translatePlace } from './places.js';

function newProductLabeling(selectedCompany, apiLabeling, labelingID) {
  // Create a new product labeling from the api data. The prices are calculated afterwards (recalculateProducts).
  const { width, height } = apiLabeling;
  return {
    enabled: true,
    global_margin: selectedCompany.id !== 2, // disabled in MidOcean
    margin: null,
    minimum: null,
    labeling: labelingID,
    labeling_field_x: width ?? null,
    labeling_field_y: height ?? null,
  };
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

function resolveMapping(selectedCompany, mappings, apiCode, apiItem, area, warn) {
  // Find the labeling to import for the given api code: either through a rule, or - if there is no
  // rule for the code - through our own labeling of that company with the very same code.
  const mapping = mappings.find((m) => m.code === apiCode);
  if (!mapping) return { company: selectedCompany.id, code: apiCode, fallback: true };

  const { type, data } = mapping;
  if (type === 'ignore') return null;
  if (type === 'direct') return { company: data.company, code: data.code };

  const value = type === 'price' ? apiItem.price : area;
  const threshold = chooseThreshold(value, data);
  if (!threshold) {
    warn(`No threshold for "${apiCode}" (for ${type} "${value}").`);
    return null;
  }
  return { company: threshold.company, code: threshold.code };
}

// Two product labelings are duplicates when all of their fields are the same.
const number = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
const place = (l) => (l.labeling_place ?? '').trim().toLowerCase();
const size = (l) => JSON.stringify([number(l.labeling_field_x), number(l.labeling_field_y)]);
const key = (l) => JSON.stringify([l.labeling ?? null, place(l), size(l)]);

export function createLabelings(selectedCompany, apiItem, { quiet = false } = {}) {
  // Create product labelings based on the data fetched from the API, and the company's mappings.
  // data: [{ techniques: ['CODE',...], label: 'top side', height: 0, width: 0, area: 0 }, ...]
  // Positions of the same labeling and field size become one labeling, with their places joined.
  // `quiet` skips the warnings, a scan would print thousands of them
  const warn = quiet ? () => {} : console.warn;
  const mappings = selectedCompany.api_labelings_mappings ?? [];
  const places = selectedCompany.api_places_mappings ?? [];
  const grouped = new Map(); // labeling and size -> { labeling, translated: [] }

  for (const apiLabeling of apiItem._labelings ?? []) {
    const { techniques, area } = apiLabeling;

    for (const apiCode of techniques) {
      const resolved = resolveMapping(selectedCompany, mappings, apiCode, apiItem, area, warn);
      if (!resolved) continue;

      const { company, code, fallback } = resolved;
      const labeling = findLabeling(get(labelings), company, code);
      if (!labeling) {
        const reason = fallback ? 'no rule and no labeling with the same code' : 'labeling not found';
        warn(`Skipping "${apiCode}" (${reason}: ${companyName(company)}/${code}).`);
        continue;
      }

      const created = newProductLabeling(selectedCompany, apiLabeling, labeling.id);
      const k = `${created.labeling}|${size(created)}`;
      if (!grouped.has(k)) grouped.set(k, { labeling: created, translated: [] });
      grouped.get(k).translated.push(translatePlace(places, apiLabeling.label));
    }
  }

  return [...grouped.values()].map(({ labeling, translated }, index) => ({
    ...labeling,
    index,
    labeling_place: joinPlaces(translated) || null,
  }));
}

export function planLabelings(selectedCompany, product, apiItem, targets = mappedLabelings(selectedCompany)) {
  // What to change so the product's labelings follow the api and the mappings.
  // Only labelings the mappings lead to are created, updated or deleted (see `isManagedLabeling`), the rest was
  // added by hand. `targets` come from `mappedLabelings`, with the codes of this scan.
  // -> { create: [labeling], update: [{ id, data }], remove: [id] }
  const all = get(labelings);
  const managedHere = (l) => isManagedLabeling(l, all, selectedCompany, targets);
  const current = product.labelings ?? [];
  const plan = { create: [], update: [], remove: [] };

  const seen = new Set();
  const managed = [];
  for (const l of current.filter(managedHere)) {
    if (seen.has(key(l))) {
      plan.remove.push(l.id); // a duplicate
    } else {
      seen.add(key(l));
      managed.push(l);
    }
  }
  const wanted = createLabelings(selectedCompany, apiItem, { quiet: true }).filter(managedHere);

  // pair every wanted labeling with a managed one: the very same first, then the closest, so a changed
  // field size - or a mapping now choosing another labeling for the same field - updates the labeling
  // instead of replacing it (keeping its margins)
  const matchers = [
    (a, b) => key(a) === key(b),
    (a, b) => a.labeling === b.labeling && place(a) === place(b),
    (a, b) => a.labeling === b.labeling && size(a) === size(b),
    (a, b) => a.labeling === b.labeling,
    (a, b) => size(a) === size(b),
  ];
  let unpaired = wanted;
  for (const matches of matchers) {
    unpaired = unpaired.filter((w) => {
      const i = managed.findIndex((m) => matches(w, m));
      if (i === -1) return true;
      const [m] = managed.splice(i, 1);
      const data = {};
      if (m.labeling !== w.labeling) data.labeling = w.labeling;
      for (const f of ['labeling_field_x', 'labeling_field_y']) {
        if (number(m[f]) !== number(w[f])) data[f] = w[f];
      }
      // the place is the scanner's too (the places mappings translate it)
      if (place(m) !== place(w)) data.labeling_place = w.labeling_place;
      if (Object.keys(data).length) plan.update.push({ id: m.id, data });
      return false;
    });
  }

  // managed labelings left unpaired are gone from the api
  plan.remove.push(...managed.map((m) => m.id));
  let index = Math.max(-1, ...current.map((l) => l.index ?? -1)) + 1;
  plan.create = unpaired.map((w) => ({ ...w, product: product.id, index: index++ }));
  return plan;
}
