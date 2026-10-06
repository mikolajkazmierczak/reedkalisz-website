<script>
  import { page } from '$app/stores';
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { header } from '@/stores';
  import { categories, companies, labelings } from '@/globals';
  import { apiCompanyId, apiTabs, fetchSnapshot, latestRead } from './company.js';
  import { tabStatuses } from './status.js';

  // what's left to do in each tab for the picked company, from its saved mappings and its last scan
  $: company = $companies?.find((c) => c.id === $apiCompanyId);
  let scan = null;
  let scanKey = null;
  $: key = company?.api_snapshot ? `${company.id}|${company.api_last_scan}` : null;
  $: if (key !== scanKey) loadScan(company, key);
  async function loadScan(company, key) {
    scanKey = key;
    scan = null;
    let items = null;
    try {
      items = key ? await fetchSnapshot(company) : null;
    } catch {
      // the tab's page shows the error
    }
    if (scanKey === key) scan = items; // not if another company was picked meanwhile
  }

  // our products of the company, just what tells them apart in a scan: for what it no longer has (see productsStatus)
  // (a refresh keeps the last ones meanwhile, so the outline doesn't blink; a failed read, the tab goes without its note)
  let products = null;
  let productsOf = null;
  const fields = ['code', 'storage.api_color_code'];
  const loadProducts = latestRead(
    (id) =>
      api
        .items('products')
        .readByQuery({ fields, filter: { company: { _eq: id } }, limit: -1 })
        .then((res) => res.data),
    (data) => (products = data),
  );
  $: if (company?.id !== productsOf) {
    productsOf = company?.id;
    products = null;
    loadProducts(productsOf);
  }
  heimdall.listen(({ match }) => match('products') && productsOf != null && loadProducts(productsOf)); // imported, deleted

  $: statuses = scan && $labelings && $categories ? tabStatuses(company, scan, $labelings, $categories, products) : {};

  $: $header = { title: 'API', icon: 'api', tabs: apiTabs($page.url.pathname, $apiCompanyId, statuses) };
</script>

<slot />
