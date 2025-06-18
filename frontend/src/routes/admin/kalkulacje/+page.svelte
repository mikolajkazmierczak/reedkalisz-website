<script>
  import { beforeNavigate } from '$app/navigation';

  import { searchparams, SearchParams } from '$/searchparams';
  import { header } from '@/stores';
  import { globals, companies } from '@/globals';
  import Filters from '@c/Filters.svelte';
  import Info from './Info.svelte';
  import Home from './home/Home.svelte';
  import Company from './company/Company.svelte';

  $header = { title: 'Kalkulacje', icon: 'calculator' };

  const searchParams = new SearchParams('/admin/kalkulacje');
  $: [company] = $searchparams.get(searchParams.pathname).values();

  let unsaved = false;

  let selectedCompany;
  $: $companies?.sort((a, b) => a.name.localeCompare(b.name));
  $: pages = $companies && [
    { label: 'Marże i Widoki', value: null },
    ...$companies.map(c => ({ label: c.name, value: c }))
  ];
  $: pages && selectPage(company); // may cause problems when editing calculations and a company updates

  function selectPage(id) {
    selectedCompany = $companies.find(c => c.id === id) || null;
    searchParams.set({ c: selectedCompany?.id || null });
  }

  function handlePageChange(e) {
    if (leaving()) selectPage(e.detail.value?.id);
  }

  beforeNavigate(navigation => {
    if (!leaving()) navigation.cancel();
  });

  function leaving() {
    if (!unsaved) return true;
    return confirm(`Zmiany nie zostały zapisane. Czy na pewno chcesz opuścić stronę?`);
  }

  globals.update(companies);
</script>

<svelte:head>
  <title>Admin | Kalkulacje | REED Kalisz</title>
</svelte:head>

{#if pages}
  <div class="actions">
    <div class="left">
      <Info />

      <div class="pages">
        <Filters filters={pages} selected={selectedCompany} on:change={handlePageChange} />
      </div>
    </div>
  </div>
{/if}

{#if $companies}
  {#if selectedCompany}
    <Company bind:unsaved company={selectedCompany} />
  {:else}
    <Home />
  {/if}
{/if}

<slot />

<style>
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: var(--border-radius);
    border: var(--border-light);
    background-color: var(--light);
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
