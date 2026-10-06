import { writable } from 'svelte/store';
import { headerTabs } from '@/tabs';

// The API page is split into tabs (products, labelings, places, categories), all for one company at a time.

const supportedCompanyNames = [
  'PAR',
  'MidOcean',
  'BlueCollection',
  'Macma',
  'EasyGifts',
  'HappyBrands',
  'Promotionway',
  'AXPOL',
  'USBSystem',
];
// whether the last scan has print data (every supplier's api has it since 2026-09-26, older scans don't)
export const hasPrintData = (items) => (items ?? []).some((i) => i._labelings?.length);

// the companies with an api, always in the same order
export const supportedCompanies = (companies) =>
  (companies ?? [])
    .filter((c) => supportedCompanyNames.includes(c.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

// the company picked in any tab, so the others open on it too
export const apiCompanyId = writable(null);

// a mapping with unsaved changes (see Panel): leaving the tab or picking another company asks first
export const unsavedMapping = writable(false);

// a company's scan asked for in a mapping tab: Produkty runs it once it has loaded that company
export const scanRequest = writable(null);

// `statuses`: what's left to do in a tab, by its path (see status.js)
export const apiTabs = (pathname, companyId, statuses = {}) =>
  headerTabs(
    pathname,
    [
      { label: 'PRODUKTY', path: '/admin/api/produkty' },
      { label: 'KATEGORIE', path: '/admin/api/kategorie' },
      { label: 'ZNAKOWANIA', path: '/admin/api/znakowania' },
      { label: 'MIEJSCA', path: '/admin/api/miejsca' },
    ].map((tab) => ({ ...tab, status: statuses[tab.path] })),
    companyId ? `?c=${companyId}` : '',
  );

// every labeling code the api uses
export const labelingCodes = (items) =>
  [...new Set((items ?? []).flatMap((i) => (i._labelings ?? []).flatMap((l) => l.techniques)))].sort();

export { fetchSnapshot, storeSnapshot } from '@/snapshot';

// the open mapping tab's products: the scan's products (its items) -> ours merged with them (see items.js combine, set
// by MappingPage), or null until both are read - what a mapping's lists of products say of each (imported, its cloud)
export const scanEntries = writable(null);

// A read a burst of changes would repeat (a recalculation reports every batch, an import every product): one at a
// time, and one more at the end for what came in meanwhile; only the reply for the id asked for last lands, a failed
// one leaves what was there. `read(id)` -> data, `land(data)`.
export function latestRead(read, land) {
  let wanted = null;
  let busy = false;
  let again = false;
  return async function load(id) {
    wanted = id;
    if (busy) return void (again = true);
    busy = true;
    try {
      do {
        again = false;
        const asked = wanted;
        if (asked == null) continue;
        const data = await read(asked).catch(() => undefined);
        if (asked === wanted && data !== undefined) land(data);
      } while (again);
    } finally {
      busy = false;
    }
  };
}
