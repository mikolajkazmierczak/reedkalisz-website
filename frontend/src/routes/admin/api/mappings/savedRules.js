import api from '$/api';
import { deep } from '%/utils';
import { companies, globals } from '@/globals';
import { overwriteGuard } from '@/overwrite';

// The rules a mapping tab keeps in the company's `field`, guarded against someone else's save (see overwrite.js).
// Compared by value, not by `date_updated`: every scan writes the company too. The tab follows the company as the store
// gives it: a new company loads the tab - once: a store update, even the echo of a save, mustn't wipe the edits - and
// another version of its rules after that is someone else's.
// `load(rules)` puts rules in the tab (the saved ones, as saved, a copy), `unsaved()` says whether it has edits.
export function savedRules(field, { load, unsaved }) {
  const value = (rules) => rules ?? []; // (null is no rules too)
  let saved; // the version the tab has: as loaded, or as it saved it
  let companyId; // the company it's of

  const guard = overwriteGuard({ loaded: () => saved, unsaved, reload: set });
  // `show: false` only remembers them (a tab that just saved what it shows)
  function set(rules, { show = true } = {}) {
    saved = deep.copy(value(rules));
    guard.reset();
    if (show) load(deep.copy(saved));
  }

  return {
    set,
    follow(company) {
      if (company.id === companyId) return guard.seen(value(company[field]));
      companyId = company.id;
      set(company[field]);
    },
    // just before saving (the store may be behind: the connection lost, say): false stops the save
    async check(company) {
      const current = value((await api.items('companies').readOne(company.id, { fields: [field] }))?.[field]);
      if (!deep.same(current, saved)) globals.update(companies, { ids: [company.id] }); // the rest of the page too
      return guard.check(current);
    },
    // Anuluj: a version accepted to save over is loaded now
    dropped: () => guard.dropped(),
  };
}
