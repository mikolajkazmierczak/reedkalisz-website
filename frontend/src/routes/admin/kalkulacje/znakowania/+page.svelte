<script>
  import { askLeaving, guardLeaving } from '@/dialog';
  import { searchparams, SearchParams } from '$/searchparams';
  import { globals, companies } from '@/globals';
  import Filters from '@c/Filters.svelte';
  import { companyIcon } from '@c/CompanyIcon.svelte';
  import Company from '../company/Company.svelte';

  const searchParams = new SearchParams('/admin/kalkulacje/znakowania');
  $: [company] = $searchparams.get(searchParams.pathname).values();

  let unsaved = false;

  let selectedCompany;
  // a sorted copy: sorting the shared list itself would reorder it on every other page
  $: pages =
    $companies &&
    [...$companies]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({ label: c.name, value: c, image: companyIcon(c) }));
  $: pages && selectPage(company); // may cause problems when editing calculations and a company updates

  function selectPage(id) {
    // the one from the url (the one picked before, when coming back), or the first one
    selectedCompany = $companies.find((c) => c.id === id) ?? pages[0]?.value;
    searchParams.set({ c: selectedCompany?.id || null });
  }

  async function handlePageChange(e) {
    if (unsaved && !(await askLeaving())) return;
    unsaved = false; // another company's table: this one's changes go
    selectPage(e.detail.value?.id);
  }

  guardLeaving(() => unsaved);

  globals.update(companies);
</script>

<svelte:head>
  <title>Admin | Kalkulacje | Znakowania | REED Kalisz</title>
</svelte:head>

<!-- the page doesn't scroll, the table does (see .ui-fill) -->
<div class="ui-fill">
  {#if pages}
    <div class="actions ui-bar">
      <div class="left">
        <div class="pages">
          <Filters filters={pages} selected={selectedCompany} on:change={handlePageChange} />
        </div>
      </div>
    </div>
  {/if}

  {#if $companies && selectedCompany}
    <Company bind:unsaved company={selectedCompany} />
  {/if}
</div>

<style>
  /* the small buttons sit 0.75rem from the top and bottom of the bar (it's as tall as a big one): as far on the left */
  .actions {
    padding-left: 0.75rem;
  }
  .actions > * {
    white-space: nowrap;
  }
  .actions > div {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
</style>
