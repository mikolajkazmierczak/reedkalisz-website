<script>
  import { deep, uid } from '%/utils';
  import { globals, globalMargins, priceViews, labelings } from '@/globals';
  import Labelings from './Labelings.svelte';

  export let unsaved;
  export let company;

  let itemsOriginal;
  let items;
  $: updateItems($labelings, company);

  function parseLabelings(labelings, company) {
    // Filtered by company, sort and add unique IDs.
    return labelings
      .filter(l => l.company === company.id)
      .sort((a, b) => a.index - b.index)
      .map(l => ({ ...l, _uid: uid(10), prices: l.prices.map(p => ({ ...p, _uid: uid(10) })) }));
  }

  function updateItems(labelings, company) {
    // `itemsCurrent` can change when some other company's labelings are updated,
    // which would trigger items to be updated causing trouble, so first we check
    // if anything even changed from the "originals" before updating `items`
    if (!labelings) return;
    const parsed = parseLabelings(labelings, company);
    itemsOriginal = deep.copy(parsed);
    items = deep.copy(parsed);
  }

  globals.update(labelings);

  // needed for recacculating prices
  globals.update(globalMargins);
  globals.update(priceViews);
</script>

{#if items}
  <div class="company">
    <div class="title">
      <h1>{company.name}</h1>
      {#if company?.api_handling_costs}
        <small>Do cen jednostkowych dodawane są koszty manipulacyjne</small>
      {/if}
    </div>

    <Labelings bind:unsaved {company} {itemsOriginal} {items} />
  </div>
{/if}

<style>
  .company {
    overflow-x: auto;
    position: relative;
    margin-bottom: 2rem;
    width: 100%;
  }
  .title {
    display: flex;
    align-items: flex-end;
    margin-bottom: 0.5rem;
  }
  .title small {
    margin-bottom: 5px;
    margin-left: 1rem;
  }
</style>
