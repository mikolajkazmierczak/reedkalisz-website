<script>
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { SearchParams, searchparams } from '$/searchparams';
  import { categories, companies, globals, labelings } from '@/globals';
  import Loader from '$c/Loader.svelte';
  import Button from '@c/Button.svelte';
  import Search from '@c/Search.svelte';
  import CompanyBar from './CompanyBar.svelte';
  import { askLeaving, guardLeaving, tell } from '@/dialog';
  import {
    apiCompanyId,
    fetchSnapshot,
    latestRead,
    scanEntries,
    scanRequest,
    supportedCompanies,
    unsavedMapping,
  } from './company.js';
  import { combine } from './items.js';
  import { thumbDeep, thumbFields } from '@/thumb';

  // A mapping tab: the company bar, then the mapping (the slot) with the company and its last scan - the mapping's own
  // bar (see Panel) joined under the companies', a line between them.
  export let pathname;
  export let title;
  export let search = false; // a search field in the bar, its text goes to the mapping as `query`

  let query = '';

  const searchParams = new SearchParams(pathname);
  $: [companyParam] = $searchparams.get(pathname).values();

  globals.update(companies);
  globals.update(labelings);
  globals.update(categories);

  // the company from the url, or the one picked in another tab, or the first one
  $: supported = supportedCompanies($companies);
  $: company = pick(supported, companyParam);
  function pick(supported, id) {
    // read, not subscribed: the store follows this page's choice below
    const picked = get(apiCompanyId);
    return supported.find((c) => c.id === id) ?? supported.find((c) => c.id === picked) ?? supported[0] ?? null;
  }
  $: if (company && company.id !== companyParam) searchParams.set({ c: company.id });
  $: if (company) $apiCompanyId = company.id;

  // unsaved changes in the mapping: asked before leaving, and before another company replaces them
  guardLeaving(() => $unsavedMapping, { discard: () => ($unsavedMapping = false) });
  async function pickCompany(id) {
    if ($unsavedMapping && !(await askLeaving())) return;
    $unsavedMapping = false;
    searchParams.set({ c: id });
  }

  // run on Produkty (its log, questions and new images are there), and only with the mapping saved: the scan applies
  // the saved one
  function scan() {
    $scanRequest = company.id;
    goto(`/admin/api/produkty?c=${company.id}`);
  }

  let apiItems = null;
  let loaded = null; // `${id}|${last scan}` of what apiItems are
  let loading = false;
  onDestroy(() => (loaded = null)); // a read still running when the page is left is dropped
  $: key = company && `${company.id}|${company.api_last_scan}`;
  $: if (key && key !== loaded) load(company, key);

  // our products of the company, as much as the mappings' lists of products show of them (see ProductsButton): read
  // with the scan, once per company, again when products change (imported, deleted); merged with the scan for the
  // lists (a failed read: the lists go without what's ours, and without the clouds)
  let dbItems = null;
  let dbOf = null;
  const fields = ['id', 'enabled', 'code', 'slug', 'name', 'storage.id', 'storage.api_color_code', ...thumbFields];
  const deep = { ...thumbDeep, storage: { img: thumbDeep.storage.img } }; // (a thumbnail each; every variant, its code)
  const loadDb = latestRead(
    (id) =>
      api
        .items('products')
        .readByQuery({ fields, filter: { company: { _eq: id } }, deep, limit: -1 })
        .then((res) => res.data),
    (data) => (dbItems = data),
  );
  $: if (company && company.id !== dbOf) {
    dbOf = company.id;
    dbItems = null;
    loadDb(dbOf);
  }
  heimdall.listen(({ match }) => match('products') && dbOf != null && loadDb(dbOf));
  // (by what's read, not by the company: its store updates, which come often, don't redo it)
  $: $scanEntries = entriesOf(dbItems, apiItems);
  onDestroy(() => ($scanEntries = null));
  function entriesOf(dbItems, apiItems) {
    if (!dbItems || !apiItems) return null;
    const entries = new Map();
    for (const item of combine(dbItems, apiItems))
      if (item._scan && !entries.has(item._scan)) entries.set(item._scan, item);
    return entries;
  }

  async function load(company, k) {
    loaded = k;
    loading = true;
    let items = null;
    try {
      items = await fetchSnapshot(company);
    } catch (e) {
      if (loaded === k) tell(e.message);
    }
    if (loaded !== k) return; // another company was picked meanwhile
    apiItems = items;
    loading = false;
  }
</script>

<svelte:head>
  <title>Admin | API | {title} | REED Kalisz</title>
</svelte:head>

{#if company}
  <!-- the companies' bar, a line, then the mapping's bar (see Panel): one frame until the mapping's bar sticks -->
  <div class="head ui-bars ui-snap" class:joined={!loading}>
    <CompanyBar companies={supported} selected={company} on:change={(e) => pickCompany(e.detail.id)}>
      <span slot="before" class="ui-lead">
        <Button
          icon="cloud"
          disabled={$unsavedMapping}
          title={$unsavedMapping ? 'Najpierw zapisz albo anuluj zmiany' : null}
          on:click={scan}>
          Skanuj
        </Button>
      </span>
      {#if search}<Search bind:query />{/if}
    </CompanyBar>
    {#if !loading}<hr class="ui-bars-divider" />{/if}
  </div>
  {#if loading}
    <p class="loading"><Loader dark /> Pobieranie danych</p>
  {:else}
    <slot {company} {apiItems} {query} />
  {/if}
{/if}

<style>
  /* the companies' bar framed as on Produkty (see .ui-bars): the frame's top line, the bar (its padding a pixel less each
     side) and the line under it two cells, less the 1px it sits inside its slot. Joined, the mapping's bar (a cell and a
     half, see Panel) goes on right under it: together the bars of Produkty */
  .head {
    display: flex;
    flex-direction: column;
  }
  .head > :global(.ui-bar) {
    flex: 1;
    min-height: 0;
    padding-block: calc(var(--bar-pad) - 1px);
  }
  .head.joined {
    margin-bottom: 0;
    border-bottom: none;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0 0.5rem;
  }
</style>
