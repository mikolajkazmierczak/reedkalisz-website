<script>
  import { afterNavigate } from '$app/navigation';

  import TableRow from '$lib/admin/common/TableRow.svelte';
  import Pagination from '$lib/admin/common/Pagination.svelte';
  import { setSearchParams, getSearchParams, treeFlatten } from '$lib/utils';

  export let limit;

  export let rootPathname;
  export let page = 1;
  export let query = null;
  afterNavigate(navigation => {
    const searchParams = getSearchParams(['p', 'q']); // page, query
    if (searchParams.p != null) page = searchParams.p;
    if (searchParams.q != null) query = searchParams.q;
    setSearchParams({ p: page, q: query }, navigation, rootPathname);
  });
  $: setSearchParams({ p: page, q: query });

  export let collection = null;
  export let items;
  export let itemsCount;
  export let head;
  export let mapper;

  $: hierarchy = items.some(item => item.children); // has children
  $: console.log('hierarchy', hierarchy);
  export let order = false;
  let expandedItems = [];

  $: itemsFlat = hierarchy ? treeFlatten(items) : items;
  $: maxDepth = hierarchy ? itemsFlat.reduce((max, item) => Math.max(max, item._meta.path.length), 0) - 1 : 0;

  const smallestColumn = 2.25;

  function getWidths(head, hierarchy, order, maxDepth) {
    let widths = [];
    if (hierarchy) widths.push(smallestColumn + maxDepth * (smallestColumn / 2) + 'rem');
    if (order) for (let i = 0; i < 4; i++) widths.push(smallestColumn + 'rem');
    if (hierarchy) widths.push(smallestColumn + 'rem');
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
    {#each items as item (item)}
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

{#if !hierarchy}
  <Pagination bind:limit bind:page total={itemsCount} />
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
</style>
