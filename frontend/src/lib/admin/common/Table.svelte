<script>
  import TableRow from '$lib/admin/common/TableRow.svelte';
  import Icon from '$lib/common/Icon.svelte';
  import { treeFlatten } from '$lib/utils';

  export let items;
  export let head;
  export let mapper;

  $: hierarchy = items.some(item => item.children); // has children
  export let order = false;
  export let collection = null;
  let expandedItems = [];

  $: itemsFlat = hierarchy ? treeFlatten(items) : items;
  $: maxDepth = hierarchy ? itemsFlat.reduce((max, item) => Math.max(max, item._meta.path.length), 0) - 1 : 0;

  const smallestColumn = 2.25;

  function getWidths(head, hierarchy, order, maxDepth) {
    let widths = [];
    if (hierarchy) widths.push(smallestColumn + maxDepth * (smallestColumn / 2) + 'rem');
    if (order)
      widths.push(smallestColumn + 'rem', smallestColumn + 'rem', smallestColumn + 'rem', smallestColumn + 'rem');
    widths.push(
      ...head.map(h => {
        if (h.width) widths.push(h.width);
        if (h.checkbox) return smallestColumn + 'rem';
        if (h.id) return '4rem';
        if (h.blame) return 'minmax(20ch, 1fr)';
        return 'minmax(15ch, 1fr)';
      })
    );
    return widths.join(' ');
  }

  $: widths = getWidths(head, hierarchy, order, maxDepth);
</script>

<div class="table-wrapper">
  <div class="table">
    <TableRow headRow {head} {hierarchy} {order} {maxDepth} {widths} {collection} />
    {#each items as item (item.id)}
      <TableRow
        bind:items
        bind:expandedItems
        {head}
        {hierarchy}
        {order}
        {maxDepth}
        {widths}
        bind:item
        {mapper}
        {collection}
      />
    {/each}
  </div>
</div>

<div class="pagination">
  <div
    class="prev"
    on:click={() => {
      // TODO: dispatch event to change data
    }}
  >
    <div class="icon">
      <Icon name="arrow_left" dark />
    </div>
  </div>
  <div
    class="next"
    on:click={() => {
      // TODO: dispatch event to change data
    }}
  >
    <div class="icon">
      <Icon name="arrow_right" dark />
    </div>
  </div>
</div>

<style>
  .table-wrapper {
    overflow-x: auto;
    border-radius: var(--border-radius);
    border: var(--border-light);
  }
  .table {
    overflow-x: auto;
  }

  .pagination {
    align-self: stretch;
    display: flex;
    border-radius: var(--border-radius);
    border: var(--border-light);
    margin-top: 1rem;
    padding: 0.5rem;
    height: 2.5rem;
    background-color: var(--light);
  }
  .pagination .icon {
    height: 100%;
  }
</style>
