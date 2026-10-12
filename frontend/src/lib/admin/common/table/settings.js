// A table's view, kept in this browser (a convenience, not data: it may be gone, e.g. in a private window):
// the columns hidden, and what each blame column shows - both by the column's label.
//   { hidden: ['Kod'], blame: { Aktualizacja: ['first_name', 'date'] } }

import { readMemo, writeMemo } from '$/memo';

const storageKey = (key) => `admin-table:${key}`;

export function readSettings(key) {
  const saved = readMemo(storageKey(key));
  return { hidden: saved?.hidden ?? [], blame: saved?.blame ?? {} };
}

export const writeSettings = (key, settings) => writeMemo(storageKey(key), settings);
