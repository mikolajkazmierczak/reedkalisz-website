<script>
  import Input from '@c/Input.svelte';

  export let prices;
  export let pricesSale;

  export let sale;
  export let fixed = false;
</script>

{#if prices.length == pricesSale.length}
  <table class="ui-table ui-table--dark">
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
  .sale {
    background-color: var(--accent-light);
  }
</style>
