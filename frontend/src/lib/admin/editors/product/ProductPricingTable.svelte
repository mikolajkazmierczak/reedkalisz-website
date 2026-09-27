<script>
  import Input from '@c/Input.svelte';

  export let prices;
  export let pricesSale;

  export let sale;
  export let fixed = false;
</script>

{#if prices.length == pricesSale.length}
  <table class="ui-table ui-table--dark" class:manual={!fixed} class:calculated={fixed}>
    <tr>
      <th>Ilość</th>
      <th>Cena</th>
      {#if sale}
        <th class="sale">Promocja</th>
      {/if}
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

<style>
  /* typed by hand: half into the box's padding, as ui-box--optional (a labeling's calculated ones stay in line) */
  .manual {
    margin-inline: -0.5rem;
    width: calc(100% + 1rem);
  }
  .manual:first-child {
    margin-top: -0.5rem;
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
