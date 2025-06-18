<script>
  import { globals, globalMargins, priceViews } from '@/globals';
  import GlobalMargins from './GlobalMargins.svelte';
  import PriceViews from './PriceViews.svelte';

  globals.update(globalMargins);
  globals.update(priceViews);
</script>

{#if $globalMargins && $priceViews}
  <div class="wrapper">
    <div class="ui-box margins">
      <h3 class="ui-h3 title">Odgórne marże</h3>
      <GlobalMargins data={$globalMargins} />
    </div>
    <div class="ui-box">
      <h3 class="ui-h3 title">Widoki</h3>
      <PriceViews items={$priceViews} />
    </div>
  </div>
{/if}

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 24.5ch 1fr;
    gap: 1rem;
  }

  .margins {
    align-self: start;
  }
</style>
