<script>
  import { tick } from 'svelte';
  import Input from '@c/Input.svelte';
  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';

  export let prices;
  export let pricesSale;

  export let sale;
  export let fixed = false;

  // the rows' and columns' names: an icon, and its name beside it (down) or in a tooltip (across, for the room)
  const heads = { amount: ['Nakład', 'number_symbol'], price: ['Cena', 'money'], sale: ['Promocja', 'sale'] };

  // calculated (`fixed`): across - the amounts in a row, their prices under them - when that fits, else down, as the
  // product page's (PricesTable); measured from the table itself, not a breakpoint. Typed by hand: always down.
  let box;
  let table;
  let need = 0;
  let across = true;
  function fit() {
    if (!box || !fixed) return;
    if (across && table) need = table.scrollWidth;
    across = need <= box.clientWidth + 1;
  }
  function resizes(node) {
    const resized = new ResizeObserver(fit);
    resized.observe(node);
    return { destroy: () => resized.disconnect() };
  }
  // measured again only when its columns change (more amounts, the sale's row), not with every price worked out
  let measuredFor = null;
  $: columns = `${prices.length}|${sale}`;
  $: if (fixed && box && columns !== measuredFor) remeasure();
  async function remeasure() {
    measuredFor = columns;
    across = true;
    await tick();
    fit();
  }
</script>

{#if prices.length == pricesSale.length}
  <div class="fit" bind:this={box} use:resizes>
    {#if fixed && across}
      <table class="ui-table ui-table--dark calculated across" bind:this={table}>
        <tr>
          <th aria-label={heads.amount[0]}>
            <Tooltip><small>{heads.amount[0]}</small></Tooltip>
            <span class="icon"><Icon fill name={heads.amount[1]} color="currentColor" /></span>
          </th>
          {#each prices as { amount }}<td class="fixed">{amount ?? '-'}</td>{/each}
        </tr>
        <tr>
          <th aria-label={heads.price[0]}>
            <Tooltip><small>{heads.price[0]}</small></Tooltip>
            <span class="icon"><Icon fill name={heads.price[1]} color="currentColor" /></span>
          </th>
          {#each prices as { price }}<td class="fixed">{price ?? '-'}</td>{/each}
        </tr>
        {#if sale}
          <tr>
            <th class="sale" aria-label={heads.sale[0]}>
              <Tooltip><small>{heads.sale[0]}</small></Tooltip>
              <span class="icon"><Icon fill name={heads.sale[1]} color="currentColor" /></span>
            </th>
            {#each pricesSale as { price }}<td class="fixed sale">{price ?? '-'}</td>{/each}
          </tr>
        {/if}
      </table>
    {:else}
      <table class="ui-table ui-table--dark" class:manual={!fixed} class:calculated={fixed}>
        <tr>
          {#each sale ? [heads.amount, heads.price, heads.sale] : [heads.amount, heads.price] as [name, icon], k}
            <th class:sale={k === 2}>
              <span class="named"><span class="icon"><Icon fill name={icon} color="currentColor" /></span>{name}</span>
            </th>
          {/each}
        </tr>

        {#each prices as { amount }, i}
          <tr>
            <td class="fixed">{amount ?? '-'}</td>

            {#if fixed}
              <td class="fixed">{prices[i].price ?? '-'}</td>
            {:else}
              <td class="input">
                <Input type="number" borderless min={0} step={0.01} bind:value={prices[i].price} />
              </td>
            {/if}

            {#if sale}
              {#if fixed}
                <td class="fixed sale">{pricesSale[i].price ?? '-'}</td>
              {:else}
                <td class="input sale">
                  <Input type="number" borderless min={0} step={0.01} bind:value={pricesSale[i].price} />
                </td>
              {/if}
            {/if}
          </tr>
        {/each}
      </table>
    {/if}
  </div>
{/if}

<style>
  /* typed by hand: half into the box's padding, as ui-box--optional (a labeling's calculated ones stay in line) */
  .manual {
    margin-inline: -0.5rem;
    width: calc(100% + 1rem);
  }
  .fit:first-child .manual {
    margin-top: -0.5rem;
  }
  .fit {
    min-width: 0;
  }
  /* a head's icon (and name) a block of its own: centred in the cell, not set on the line of text */
  .icon {
    display: flex;
    flex: none;
    width: 0.95rem;
    height: 0.95rem;
  }
  .named {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  /* the names (Nakład, Cena, Promocja) as a field's (.ui-label), a little smaller and closer (they take less room
     across) */
  th {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--ink-label);
  }
  /* across: the names in a column of their own, the figures as wide as they need, as little beside them as reads
     well (more amounts fit across) */
  .across {
    width: auto;
    max-width: 100%;
  }
  .across th,
  .across td {
    padding: 0 0.375rem;
  }
  .across th {
    width: 1%;
    white-space: nowrap;
  }
  .across td {
    white-space: nowrap;
    text-align: right;
  }
  /* calculated: nothing to type, so lower rows than a table of fields, the numbers a little smaller */
  .calculated th,
  .calculated td {
    height: 1.625rem;
  }
  .calculated td {
    font-size: 0.875rem;
  }
  /* calculated: nothing to type, but not greyed out either - white, as the fields of the table typed by hand */
  .calculated .fixed {
    background-color: var(--light);
  }
  /* the sale's: as the box of the sale's price (ui-box--optional) */
  .sale,
  .calculated .fixed.sale {
    background-color: var(--blue-100);
  }
</style>
