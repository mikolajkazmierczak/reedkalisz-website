<script>
  import PricesTable from './PricesTable.svelte';
  import Icon from '$c/Icon.svelte';

  export let field;
  export let place;

  export let prices;
  export let pricesSale;
  export let pricesWithLabeling;
</script>

{#if field[0] && field[1]}
  <small class="info field">
    <Icon name="arrow_expand" height="1.25rem" style="position:relative;top:1px;" />Pole znakowania:
    <b>{field[0]}x{field[1]} mm</b>
  </small>
{/if}
{#if place}
  <small class="info place">
    <Icon name="resize_small" height="1.25rem" style="position:relative;top:1px;" />Miejsce znakowania: <b>{place}</b>
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
  .info {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    opacity: 0.6;
  }
</style>
