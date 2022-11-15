<script>
  import { page } from '$lib/admin/stores';

  import { updateGlobal, companies, labelings, priceViews, globalMargins } from '$lib/admin/global';
  import PriceViews from './PriceViews.svelte';
  import GlobalMargins from './GlobalMargins.svelte';
  import Labelings from './Labelings.svelte';

  $page = { title: 'Kalkulacje', icon: 'calculator' };

  async function read() {
    await updateGlobal(globalMargins);
    await updateGlobal(priceViews);
    await updateGlobal(companies);
    await updateGlobal(labelings);
  }

  read();
</script>

<div class="wrapper">
  {#if $globalMargins && $priceViews}
    <sidebar>
      <div>
        <h3 class="title">Globalne marże</h3>
        <GlobalMargins bind:data={$globalMargins} />
      </div>
      <div>
        <h3 class="title">Widoki</h3>
        <PriceViews bind:items={$priceViews} />
      </div>
    </sidebar>
  {/if}

  <div class="labelings">
    {#if $companies && $labelings}
      {#each $companies as company}
        {@const items = $labelings.filter(l => l.company === company.id)}
        <div class="company">
          <h2>{company.name}</h2>
          <Labelings {company} {items} />
        </div>
      {/each}
    {/if}
  </div>
</div>

<slot />

<style>
  .wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }

  sidebar {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1.5rem 1rem;
    width: 40ch;
    border-radius: var(--border-radius);
    border: var(--border-light);
    background-color: var(--light);
  }
  sidebar .title {
    margin-bottom: 0.5rem;
  }

  .labelings {
    overflow-x: auto;
    width: 100%;
  }
  .company {
    margin-bottom: 2rem;
  }
  .company h2 {
    margin-bottom: 0.5rem;
  }
</style>
