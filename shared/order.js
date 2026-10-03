// The order of a product's rows that aren't put in order by hand, each row's `index` its place - the product editor
// sets it on every save, the API import on every import (scripts/sort-rows.mjs once for the ones saved before).
// The same rows, in place: the editor keeps showing them.

// codes as the suppliers number them: 'R08312.04' before 'R08312.15', 'MO9469-3' before 'MO9469-10'
export const natural = (a, b) => (a ?? '').localeCompare(b ?? '', 'pl', { numeric: true, sensitivity: 'base' });

// Variants by their code (see natural); the ones without one after them, as they were.
export const sortVariants = (storage) => reindex(orderVariants(storage));

// (the same order in a new array, the rows untouched: what saving will make of them)
export function orderVariants(storage) {
  const code = (s) => s.api_color_code?.trim() || null;
  return [...storage].sort((a, b) => !code(a) - !code(b) || natural(code(a), code(b)));
}

// Labelings as Kalkulacje lists them: the product's company's first, then the others (REED's), each company's in its
// own order there; the same labeling by its field, the smaller first (one without a size last), then its place.
export function sortLabelings(rows, labelings, company) {
  const byId = new Map((labelings ?? []).map((l) => [l.id, l]));
  const area = (row) => {
    const [x, y] = [row.labeling_field_x, row.labeling_field_y].map((v) => (v == null || v === '' ? null : +v));
    return x == null && y == null ? Infinity : (x ?? 1) * (y ?? 1);
  };
  const key = (row) => {
    const l = byId.get(row.labeling);
    return [l ? (l.company === company ? 0 : 1) : 2, l?.company ?? 0, l?.index ?? 0, row.labeling ?? 0, area(row)];
  };
  return reindex(
    rows
      .map((row) => ({ row, key: key(row) }))
      .sort((a, b) => {
        for (let i = 0; i < a.key.length; i++) if (a.key[i] !== b.key[i]) return a.key[i] < b.key[i] ? -1 : 1;
        return natural(a.row.labeling_place, b.row.labeling_place);
      })
      .map(({ row }) => row),
  );
}

export function reindex(rows) {
  rows.forEach((row, index) => (row.index = index));
  return rows;
}
