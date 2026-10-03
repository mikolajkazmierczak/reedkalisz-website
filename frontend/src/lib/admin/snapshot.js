import { baseUrl } from '$/api';
import { planDetails } from '@/details';
import { indexScan, scanProduct, scanVariant } from '@/match';
import { isApiCompany } from '@/sync';

// A supplier's last scan (the "snapshot", a gzipped json in the library), and what of our product the scanner takes
// from it.

// a scan as it's saved: gzipped, a tenth of the size (AXPOL's 10 MB is 1 MB) - to upload and to download every time
export async function packSnapshot(items) {
  const gzipped = new Blob([JSON.stringify(items)]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Blob([await new Response(gzipped).blob()], { type: 'application/gzip' });
}
// the one reader of a saved scan: gzipped, or plain json as they were saved before - told apart by gzip's first bytes,
// not the file's type (a server on the way may have unpacked it already)
async function unpackSnapshot(res) {
  const bytes = new Uint8Array(await res.arrayBuffer());
  const gzipped = bytes[0] === 0x1f && bytes[1] === 0x8b;
  const json = gzipped ? new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')) : bytes;
  return await new Response(json).json();
}

// the products of the company's last scan, or null before the first one - downloaded once per scan: the header and
// the tab share it (they only read it)
const snapshots = new Map(); // company id -> { key, promise }, only the last company's: they're big (up to ~10 MB)
export function fetchSnapshot(company) {
  const { id, api_snapshot: snapshot, api_last_scan: version } = company ?? {};
  if (!snapshot) return Promise.resolve(null);
  const key = `${snapshot}|${version}`;
  if (snapshots.get(id)?.key !== key) {
    // the version avoids the browser's cache
    const promise = fetch(`${baseUrl}/assets/${snapshot}?v=${version}`).then(async (res) => {
      if (!res.ok) throw new Error(`Nie udało się pobrać ostatniego skanu (${res.status}).`);
      return await unpackSnapshot(res);
    });
    promise.catch(() => snapshots.get(id)?.promise === promise && snapshots.delete(id)); // tried again next time
    snapshots.clear();
    snapshots.set(id, { key, promise });
  }
  return snapshots.get(id).promise;
}
// a scan just saved (`company` as saved with it): the tabs take it as it is, without downloading it again
export function storeSnapshot(company, items) {
  snapshots.clear();
  snapshots.set(company.id, {
    key: `${company.api_snapshot}|${company.api_last_scan}`,
    promise: Promise.resolve(items),
  });
}

const indexes = new WeakMap(); // a downloaded scan -> its index (see match.js), made once
function indexOf(items) {
  if (!indexes.has(items)) indexes.set(items, indexScan(items));
  return indexes.get(items);
}

// the product's part of its company's last scan: { item, scan }, or null when the scanner leaves it be - no scan, or
// the supplier has it no more (then it's only hidden and zeroed)
export async function scannedProduct(product, company) {
  const items = product && (await fetchSnapshot(company).catch(() => null));
  if (!items) return null;
  const scan = indexOf(items);
  const item = scanProduct(product, scan);
  return item ? { item, scan } : null;
}

// What of the product the scanner overwrites (see the API page's scan): `scanned` from scannedProduct, undefined while it
// loads (then all it may take counts). The name only while nobody renamed it: `nameEdited`.
export function scannerFields(product, company, scanned) {
  if (!isApiCompany(company) || scanned === null || !product) return { variant: () => false };
  const loading = scanned === undefined;
  // the details the supplier gives: what the scan would set in a product without any
  const details = loading ? null : planDetails({ materials: [] }, scanned.item);
  const has = (field) => loading || field in details;
  return {
    name: has('name'),
    nameEdited: !loading && has('name') && product.name?.trim() !== details.name,
    apiName: loading ? null : details.name,
    description: has('description'),
    size_x: has('size_x'),
    size_y: has('size_y'),
    size_z: has('size_z'),
    materials: has('materials'),
    price: true,
    handling_cost: true,
    labelings: true, // the ones the mappings lead to (see isManagedLabeling)
    categories: true, // (see isManagedCategory)
    variant: (storage) => loading || !!scanVariant(storage, scanned.scan), // its amount
  };
}
