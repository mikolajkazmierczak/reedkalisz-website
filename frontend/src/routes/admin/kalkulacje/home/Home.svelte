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
      <!-- a copy: the fields edit it in place, and margins typed but not saved mustn't reach the store -->
      <GlobalMargins data={{ ...$globalMargins }} />
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
    grid-template-columns: round(up, 24.5ch, var(--half)) minmax(0, 1fr); /* (whole half cells: the views on a line) */
    gap: var(--page-pad);
  }

  .margins {
    align-self: start;
  }
  /* a phone: the views under the margins */
  @media (max-width: 50rem) {
    .wrapper {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
