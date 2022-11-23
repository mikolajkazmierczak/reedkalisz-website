<script>
  import { header } from '@/stores';

  import { globals, companies, labelings, priceViews, globalMargins } from '@/globals';
  import PriceViews from './PriceViews.svelte';
  import GlobalMargins from './GlobalMargins.svelte';
  import Labelings from './Labelings.svelte';

  $header = { title: 'Kalkulacje', icon: 'calculator' };

  async function read() {
    await globals.update(globalMargins);
    await globals.update(priceViews);
    await globals.update(companies);
    await globals.update(labelings);
  }

  $: $companies?.sort((a, b) => a.name.localeCompare(b.name));

  read();
</script>

<div class="wrapper">
  {#if $globalMargins && $priceViews}
    <sidebar>
      <div class="ui-box">
        <h3 class="ui-h3 title">Globalne marże</h3>
        <GlobalMargins bind:data={$globalMargins} />
      </div>
      <div class="ui-box">
        <h3 class="ui-h3 title">Widoki</h3>
        <PriceViews bind:items={$priceViews} />
      </div>
    </sidebar>
  {/if}

  <div class="labelings">
    {#if $companies && $labelings}
      {#each $companies as company}
        {@const items = $labelings.filter(l => l.company === company.id)}
        <div class="company">
          <h1>{company.name}</h1>
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
    gap: 1.5rem;
  }

  sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 40ch;
  }

  .labelings {
    overflow-x: auto;
    width: 100%;
  }
  .company {
    margin-bottom: 2rem;
  }
  .company h1 {
    margin-bottom: 0.5rem;
  }
</style>
