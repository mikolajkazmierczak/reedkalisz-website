<script>
  import { treeFlatten } from '%/utils';
  import TableRow from '@c/TableRow.svelte';
  import Pagination from '@c/Pagination.svelte';

  export let searchParams = null;
  export let limit = null;
  export let page = null;

  export let collection = null;
  export let itemsCount = null;
  export let items;
  export let head;
  export let mapper;

  export let order = false;

  $: tree = items.some(item => item.children); // has children
  $: itemsFlat = tree ? treeFlatten(items) : items;
  $: maxDepth = tree ? itemsFlat.reduce((max, item) => Math.max(max, item._meta.path.length), 0) - 1 : 0;
  let expandedItems = [];

  const smallestCellWidth = 2.25;
  const hierarchyCellWidth = smallestCellWidth * 0.8;

  function getWidths(head, tree, order, maxDepth) {
    let widths = [];
    if (order) widths.push(smallestCellWidth + 'rem');
    if (tree) widths.push(hierarchyCellWidth * (maxDepth + 1) + 'rem');
    widths.push(
      ...head.map(h => {
        if (h.width) widths.push(h.width);
        if (h.checkbox) return smallestCellWidth + 'rem';
        if (h.id || h.thin) return '4rem';
        if (h.blame) return 'minmax(20ch, 1fr)';
        return 'minmax(15ch, 1fr)';
      })
    );
    return widths.join(' ');
  }

  let showDropzonesItemID = null; // id
  function dropzonesHide() {
    showDropzonesItemID = null;
  }
  function dropzonesShow(e) {
    showDropzonesItemID = e.detail.id;
  }

  $: widths = getWidths(head, tree, order, maxDepth);
</script>

<div class="table-wrapper">
  <div class="table">
    <TableRow headRow {head} {order} {tree} {maxDepth} {widths} {collection} />
    {#if items.length}
      {#each items as item (item)}
        <TableRow
          {collection}
          {head}
          bind:items
          bind:item
          {mapper}
          {order}
          {tree}
          {maxDepth}
          {widths}
          bind:expandedItems
          {showDropzonesItemID}
          on:drop={dropzonesHide}
          on:dragend={dropzonesHide}
          on:dragenterItem={dropzonesShow}
        />
      {/each}
    {:else}
      <div class="empty">Brak elementów o podanych parametrach</div>
    {/if}
  </div>
</div>

{#if itemsCount != -1}
  <Pagination {searchParams} bind:limit bind:page count={itemsCount} />
{/if}

<style>
  .table-wrapper {
    overflow-x: auto;
    border-radius: var(--border-radius);
    border: var(--border-light);
  }
  .table {
    overflow-x: auto;
  }

  .empty {
    padding: 1rem;
    width: 100%;
    background-color: var(--accent-white);
  }
</style>
