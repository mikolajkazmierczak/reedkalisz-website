<script>
  import { page } from '$app/stores';
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { header } from '@/stores';
  import { categories, companies, labelings } from '@/globals';
  import { apiCompanyId, apiTabs, fetchSnapshot } from './company.js';
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
  let products = null;
  let productsOf = null;
  let productsRun = 0;
  $: if (company?.id !== productsOf) loadProducts(company?.id);
  async function loadProducts(id) {
    if (id !== productsOf) products = null; // a refresh keeps the last ones meanwhile, so the outline doesn't blink
    productsOf = id;
    const run = ++productsRun; // only the latest read lands: refreshes come in bursts
    if (id == null) return;
    const fields = ['code', 'storage.api_color_code'];
    try {
      const res = await api.items('products').readByQuery({ fields, filter: { company: { _eq: id } }, limit: -1 });
      if (run === productsRun) products = res.data;
    } catch {
      // the tab just goes without its note
    }
  }
  heimdall.listen(({ match }) => {
    if (match('products') && productsOf != null) loadProducts(productsOf); // imported, deleted
  });

  $: statuses = scan && $labelings && $categories ? tabStatuses(company, scan, $labelings, $categories, products) : {};

  $: $header = { title: 'API', icon: 'api', tabs: apiTabs($page.url.pathname, $apiCompanyId, statuses) };
</script>

<slot />
