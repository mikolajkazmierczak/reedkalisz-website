// A table's view, kept in this browser (a convenience, not data: it may be gone, e.g. in a private window):
// the columns hidden, and what each blame column shows - both by the column's label.
//   { hidden: ['Kod'], blame: { Aktualizacja: ['first_name', 'date'] } }

const storageKey = (key) => `admin-table:${key}`;

export function readSettings(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(key)));
    return { hidden: saved?.hidden ?? [], blame: saved?.blame ?? {} };
  } catch {
    return { hidden: [], blame: {} };
  }
}

export function writeSettings(key, settings) {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(settings));
  } catch {
    // not kept: it lasts while the page is open
  }
}
