<script>
  import PricesTable from './PricesTable.svelte';
  import IncludesLabeling from './IncludesLabeling.svelte';

  export let field;
  export let place;

  export let prices;
  export let pricesSale;
  export let pricesWithLabeling;
  /** False when the section's head already shows the note for every price list. */
  export let showIncludes = true;

  $: includes = pricesWithLabeling && showIncludes;
</script>

{#if $$slots.default || includes}
  <!-- the labeling's name (the slot); the note beside it, when the section's head doesn't carry it for every list -->
  <div class="head">
    <slot />
    {#if includes}<IncludesLabeling />{/if}
  </div>
{/if}

<div class="prices">
  <PricesTable
    prices={prices.filter((p) => p.enabled)}
    pricesSale={pricesSale.filter((p) => p.enabled)}
    withLabeling={!!pricesWithLabeling}
    field={field[0] && field[1] ? `${field[0]}×${field[1]} mm` : null}
    {place} />
</div>

<style>
  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-2) var(--sp-4);
    margin-bottom: var(--sp-2);
  }

  .prices {
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
  }
</style>
