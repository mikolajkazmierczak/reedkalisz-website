<script>
  import Input from '$lib/admin/input/Input.svelte';

  export let prices;
  export let pricesSale;

  export let fixedAmountsArray = [];
  export let fixedPrices = false;
  export let sale;

  function pushSingle(prices, enabled, amount, price) {
    prices.push({ enabled, amount, price });
    prices = prices;
  }
  function pushPair({ enabled = true, amount = null, price = null } = {}) {
    pushSingle(prices, enabled, amount, price);
    pushSingle(pricesSale, enabled, amount, price);
  }

  function removeSingle(prices, i) {
    prices.splice(i, 1);
    prices = prices;
  }
  function removePair(i) {
    removeSingle(prices, i);
    removeSingle(pricesSale, i);
  }

  function sortByAmount(prices) {
    // sort items by their amounts
    prices.sort((a, b) => a.amount - b.amount);
  }
  function sortByAmountAll() {
    sortByAmount(prices);
    sortByAmount(pricesSale);
  }
  function sortIds(prices) {
    // reassign existing ids in ascending order
    let ids = [];
    prices.forEach(p => {
      if (p.id) ids.push(p.id);
      delete p.id;
    });
    ids.sort((a, b) => a - b);
    prices.forEach(p => (p.id = ids.shift()));
    prices = prices;
  }
  function sortIdsAll() {
    sortIds(prices);
    sortIds(pricesSale);
  }
  function sortItems() {
    sortByAmountAll();
    sortIdsAll();
  }

  function pushCounterparts(prices1, prices2) {
    prices1.forEach(p1 => {
      const pair = prices2.find(p2 => p2.amount == p1.amount);
      if (!pair) pushSingle(prices2, p1.enabled, p1.amount, null);
    });
  }
  function removeDuplicates() {
    sortByAmountAll(); // this function relies on indexes so the items must be sorted first
    let amounts = [];
    // go through in reverse order to not mess up the indexes when deleting items
    for (let i = prices.length - 1; i >= 0; i--) {
      const amount = prices[i].amount;
      if (amounts.includes(amount)) {
        removePair(i);
      } else {
        amounts.push(amount);
      }
    }
  }

  function pushMissing() {
    fixedAmountsArray.forEach(amount => {
      const single = prices.find(p => p.amount == amount);
      if (!single) pushPair({ amount });
    });
  }
  function removeUnused() {
    // go through in reverse order to not mess up the indexes
    for (let i = prices.length - 1; i >= 0; i--) {
      const amount = prices[i].amount;
      if (!fixedAmountsArray.includes(amount)) {
        removePair(i);
      }
    }
  }

  function repair() {
    pushCounterparts(prices, pricesSale);
    pushCounterparts(pricesSale, prices);
    removeDuplicates();
  }

  function cleanup() {
    pushMissing();
    removeUnused();
    sortItems();
  }

  repair();
  $: if (prices || pricesSale || fixedAmountsArray) cleanup();
</script>

<div class="wrapper">
  <table class="ui-table">
    <tr>
      <th>Ilość</th>
      <th>Cena</th>
      {#if sale}<th class="sale">Promocja</th>{/if}
    </tr>
    {#each prices as { amount, price }, i}
      <tr>
        <td class="fixed">{amount ?? '-'}</td>

        {#if fixedPrices}
          <td class="fixed">{price ?? '-'}</td>
        {:else}
          <td class="input">
            <Input type="number" borderless min={0} step={0.01} bind:value={price} />
          </td>
        {/if}

        {#if sale}
          {#if fixedPrices}
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
</div>

<style>
  .sale {
    background-color: var(--accent-light);
  }
</style>
