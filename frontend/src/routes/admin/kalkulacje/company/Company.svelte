<script>
  import { deep, uid } from '%/utils';
  import { globalMargins, globals, labelings, priceViews } from '@/globals';
  import Labelings from './Labelings.svelte';

  export let unsaved;
  export let company;

  let saving = false;

  let itemsOriginal;
  let items;
  $: updateItems($labelings, company);

  function parseLabelings(labelings, company) {
    // filter by company, sort and add unique IDs.
    return labelings
      .filter((l) => l.company === company.id)
      .sort((a, b) => a.index - b.index)
      .map((l) => ({
        ...l,
        _uid: uid(10),
        prices: l.prices.sort((a, b) => a.amount - b.amount).map((p) => ({ ...p, _uid: uid(10) })),
      }));
  }

  function updateItems(labelings, company) {
    if (!labelings) return;
    if (saving) return; // blocks updates when saving
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
  <div class="company ui-fill-col">
    <Labelings bind:unsaved bind:saving {company} {itemsOriginal} {items} />
  </div>
{/if}

<style>
  /* the table and what's under it in a column, the table giving way when the page is short (see .ui-fill) */
  .company {
    position: relative;
    width: 100%;
  }
</style>
