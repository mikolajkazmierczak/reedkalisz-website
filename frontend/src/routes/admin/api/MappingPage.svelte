<script>
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { SearchParams, searchparams } from '$/searchparams';
  import { categories, companies, globals, labelings } from '@/globals';
  import Loader from '$c/Loader.svelte';
  import Button from '@c/Button.svelte';
  import Search from '@c/Search.svelte';
  import CompanyBar from './CompanyBar.svelte';
  import { askLeaving, guardLeaving, tell } from '@/dialog';
  import { apiCompanyId, fetchSnapshot, scanRequest, supportedCompanies, unsavedMapping } from './company.js';

  // A mapping tab: the company bar, then the mapping (the slot) with the company and its last scan.
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
  {#if loading}
    <p class="loading"><Loader dark /> Pobieranie danych</p>
  {:else}
    <slot {company} {apiItems} {query} />
  {/if}
{/if}

<style>
  .loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0 0.5rem;
  }
</style>
