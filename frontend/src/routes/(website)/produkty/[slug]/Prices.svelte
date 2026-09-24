<script>
  import PricesTable from './PricesTable.svelte';
  import IncludesLabeling from './IncludesLabeling.svelte';

  export let field;
  export let place;

  export let prices;
  export let pricesSale;
  export let pricesWithLabeling;
  /** False when the caller already shows the note beside its own heading. */
  export let showIncludes = true;
</script>

{#if pricesWithLabeling && showIncludes}
  <div class="includes"><IncludesLabeling /></div>
{/if}

{#if (field[0] && field[1]) || place}
  <div class="meta">
    {#if field[0] && field[1]}
      <span class="meta__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
          <path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Pole znakowania: <b class="tnum">{field[0]}&times;{field[1]} mm</b>
      </span>
    {/if}
    {#if place}
      <span class="meta__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
          <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" stroke-linejoin="round" />
          <circle cx="12" cy="10" r="2.4" />
        </svg>
        Miejsce znakowania: <b>{place}</b>
      </span>
    {/if}
  </div>
{/if}

<div class="prices">
  <PricesTable
    prices={prices.filter((p) => p.enabled)}
    pricesSale={pricesSale.filter((p) => p.enabled)}
    withLabeling={!!pricesWithLabeling} />
</div>

<style>
  .includes {
    margin-bottom: var(--sp-3);
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sp-2) var(--sp-5);
    margin-bottom: var(--sp-3);
  }
  .meta__item {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
    white-space: nowrap;
    color: var(--text-muted);
    font-size: var(--fs-sm);
  }
  .meta__item svg {
    width: 1rem;
    height: 1rem;
    color: var(--text-subtle);
  }
  .meta__item b {
    color: var(--text);
    font-weight: 600;
  }

  .prices {
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
  }
</style>
