<script>
  import { onMount } from 'svelte';

  export let prices;
  export let pricesSale;
  /** The price row is labelled with what the price includes. */
  export let withLabeling = false;

  // Horizontal when it fits, else vertical — measured from the table itself, not a breakpoint.
  let box;
  let table;
  let need = 0;
  let vertical = false;
  function fit() {
    if (!box) return;
    if (!vertical && table) need = table.scrollWidth;
    vertical = need > box.clientWidth + 1;
  }
  onMount(() => {
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  });
</script>

<div class="ladder" bind:this={box}>
  {#if vertical}
    <table class="down">
      <thead>
        <tr>
          <th scope="col">Ilość</th>
          <th scope="col">
            PLN / szt.
            <small class:with={withLabeling}>{withLabeling ? 'ze znakowaniem' : 'netto'}</small>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each prices as { amount, price }, i}
          {@const sale = !!pricesSale[i]?.price}
          <tr>
            <td class="tnum qty">{amount ?? '-'}</td>
            <td class="tnum">
              {#if sale}
                <s class="was was--inline">{price?.toFixed(2) ?? '-'}</s>
                <span class="now now--sale">{pricesSale[i].price.toFixed(2)}</span>
              {:else}
                <span class="now">{price?.toFixed(2) ?? '-'}</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <div class="scroller">
      <table bind:this={table}>
        <thead>
          <tr>
            <th scope="row">Ilość</th>
            {#each prices as { amount }}
              <td class="tnum">{amount ?? '-'}</td>
            {/each}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">
              PLN / szt.
              <small class:with={withLabeling}>{withLabeling ? 'ze znakowaniem' : 'netto'}</small>
            </th>
            {#each prices as { price }, i}
              {@const sale = !!pricesSale[i]?.price}
              <td class="tnum">
                {#if sale}
                  <span class="now now--sale">{pricesSale[i].price.toFixed(2)}</span>
                  <s class="was">{price?.toFixed(2) ?? '-'}</s>
                {:else}
                  <span class="now">{price?.toFixed(2) ?? '-'}</span>
                {/if}
              </td>
            {/each}
          </tr>
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  /* Currency once in the row label; columns fit their figures. Long ladders scroll. */
  .scroller {
    overflow-x: auto;
    margin-inline: calc(var(--gutter) * -1);
    padding-inline: var(--gutter);
    overscroll-behavior-x: contain;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: var(--sp-2);
    border: 1px solid var(--border);
    text-align: right;
    white-space: nowrap;
  }

  th {
    position: sticky;
    left: 0;
    z-index: 1;
    width: 1%;
    padding-inline: var(--sp-3);
    background-color: var(--paper-2);
    color: var(--text-subtle);
    font-size: var(--fs-xs);
    font-weight: 600;
    line-height: 1.25;
    text-align: left;
  }
  th small {
    display: block;
    font-size: 0.6875rem;
    font-weight: 500;
  }
  th small.with {
    color: var(--red);
    font-weight: 700;
  }

  thead td {
    background-color: var(--paper-2);
    font-size: var(--fs-sm);
    font-weight: 600;
  }
  thead th,
  thead td {
    padding-block: var(--sp-1);
  }

  tbody td {
    font-size: var(--fs-sm);
  }

  .now {
    font-weight: 700;
  }
  .now--sale {
    color: var(--accent);
  }
  .was {
    display: block;
    color: var(--text-subtle);
    font-size: var(--fs-xs);
    font-weight: 400;
  }

  /* --- vertical: one row per quantity --- */
  .down th {
    position: static;
    width: auto;
    padding-inline: var(--sp-3);
  }
  .down th:last-child,
  .down td:last-child {
    text-align: right;
  }
  .down td {
    padding-inline: var(--sp-3);
  }
  .down .qty {
    background-color: var(--paper-2);
    font-weight: 600;
    text-align: left;
  }
  .was--inline {
    display: inline;
    margin-right: var(--sp-2);
  }

  @media (min-width: 56.25rem) {
    .scroller {
      margin-inline: 0;
      padding-inline: 0;
    }
  }
</style>
