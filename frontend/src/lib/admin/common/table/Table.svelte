<script>
  import { treeFlatten } from '%/utils';
  import TableRow from '@c/table/TableRow.svelte';
  import Pagination from '@c/Pagination.svelte';
  import { getColumnWidths } from './utils';

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
  let expandedItems = []; // ids
  let dropzone = null; // id

  $: widths = getColumnWidths(head, tree, order, maxDepth);
</script>

<div class="table-wrapper">
  <div class="table">
    <TableRow {collection} headRow {head} {order} {tree} {maxDepth} {widths} bind:dropzone />
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
          bind:dropzone
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
