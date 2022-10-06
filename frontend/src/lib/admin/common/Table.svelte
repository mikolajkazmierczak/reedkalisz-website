<script>
  // import { onMount } from 'svelte';
  // import Sortable from 'sortablejs';

  import TableRow from '$lib/admin/common/TableRow.svelte';
  import Icon from '$lib/common/Icon.svelte';
  import { treeFlatten } from '$lib/utils';

  export let items;
  $: console.log(items);
  export let head;
  export let mapper;

  $: hierarchy = items.some(item => item.children); // has children
  export let order = false;
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

  // function findNestedItem(items, id) {
  //   for (let item of items) {
  //     if (item.id === id) return item;
  //     if (item.children) {
  //       let nestedItem = findNestedItem(item.children, id);
  //       if (nestedItem) return nestedItem;
  //     }
  //   }
  // }

  // let dragging = false;
  // let dragged;
  // let draggedItem;
  // let sortable;
  // let sortableConfig = {
  //   group: 'nested',
  //   animation: 150,
  //   handle: '.value--order',
  //   fallbackOnBody: true,
  //   swapThreshold: 0.65,
  //   onStart: e => {
  //     dragging = true;
  //     dragged = e.item;
  //     maxDepth++;
  //     const id = Number(dragged?.getAttribute('data-id'));
  //     draggedItem = findNestedItem(items, id);
  //   },
  //   onMove: e => {
  //     const parent = dragged?.parentElement;
  //     const parentDepth = Number(parent.getAttribute('data-depth'));
  //     draggedItem._meta.depth = parentDepth + 1;
  //     console.log(draggedItem, parentDepth);
  //     items = items;
  //   },
  //   onEnd: e => {
  //     dragging = false;
  //     dragged = null;
  //     draggedItem = null;
  //     maxDepth--;
  //   }
  // };
  // onMount(() => {
  //   new Sortable.create(sortable, sortableConfig);
  // });

  // $: padded = dragging;
</script>

<div class="table-wrapper">
  <div class="table">
    <TableRow headRow {head} {hierarchy} {order} {maxDepth} {widths} />
    <!-- <div class="sortable" bind:this={sortable} class:padded data-depth={-1}> -->
    {#each items as item (item)}
      <TableRow
        {head}
        {items}
        {hierarchy}
        {order}
        {maxDepth}
        {widths}
        {item}
        {mapper}
        bind:expandedItems
        on:update={() => (items = items)}
      />
    {/each}
    <!-- {dragging} -->
    <!-- {dragged} -->
    <!-- {sortableConfig} -->
    <!-- </div> -->
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
  /* .sortable {
    background-color: var(--accent-light);
    transition: padding 0.2s;
  }
  .sortable.padded {
    padding-bottom: 1rem;
  } */

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
