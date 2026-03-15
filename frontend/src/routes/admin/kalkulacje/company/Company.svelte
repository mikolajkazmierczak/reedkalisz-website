<script>
  import { deep, uid } from "%/utils";
  import { globalMargins, globals, labelings, priceViews } from "@/globals";
  import Labelings from "./Labelings.svelte";

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
  <div class="company">
    <div class="title">
      <h1>{company.name}</h1>
      {#if company?.api_handling_costs}
        <small>Do cen jednostkowych dodawane są koszty manipulacyjne</small>
      {/if}
    </div>

    <Labelings bind:unsaved bind:saving {company} {itemsOriginal} {items} />
  </div>
{/if}

<style>
  .company {
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
