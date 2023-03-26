<script>
  import PricesTable from './PricesTable.svelte';

  export let field;
  export let place;

  export let prices;
  export let pricesSale;
  export let pricesWithLabeling;
</script>

{#if field[0] && field[1]}
  <small class="field">
    Pole znakowania: {field[0]}x{field[1]} mm
  </small>
{/if}
{#if place}
  <small class="place">
    Miejsce znakowania: {place}
  </small>
{/if}
<div class="prices">
  <PricesTable prices={prices.filter(p => p.enabled)} pricesSale={pricesSale.filter(p => p.enabled)} />
  {#if pricesWithLabeling}
    <div class="prices-with-labeling">Ceny ze znakowaniem</div>
  {/if}
</div>

<style>
  .prices-with-labeling {
    display: inline-block;
    opacity: 0.6;
    border-top: none;
    padding: 0.25rem 0.5rem;
    background-color: var(--grey);
    font-size: small;
    text-transform: uppercase;
  }
  .prices {
    margin-top: 0.5rem;
  }
  .field,
  .place {
    display: block;
    opacity: 0.6;
  }
</style>
