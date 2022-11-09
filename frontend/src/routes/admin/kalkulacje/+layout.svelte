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

  {#if $companies && $labelings}
    <Labelings bind:companies={$companies} bind:labelings={$labelings} />
  {/if}
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
    min-width: 350px;
    border-radius: var(--border-radius);
    border: var(--border-light);
    background-color: var(--light);
  }
  sidebar .title {
    margin-bottom: 0.5rem;
  }
</style>
