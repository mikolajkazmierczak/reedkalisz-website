<script>
  import { goto } from '$app/navigation';
  import { slide } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  import api from '$lib/api';
  import socket from '$lib/heimdall';
  import { treeGetItemAtPath, treeMoveItemToPath } from '$lib/utils';

  import Icon from '$lib/common/Icon.svelte';
  import Blame from '$lib/admin/common/Blame.svelte';

  const dispatch = createEventDispatcher();

  const smallestCellWidth = 2.25;
  const hierarchyCellWidth = smallestCellWidth * 0.8;

  export let items = null;
  export let headRow = false;
  export let head;

  export let hierarchy = false;
  export let order = false;
  export let maxDepth = 0;
  export let widths;

  export let item = null;
  export let mapper = null;
  $: row = item ? mapper(item) : null; // href, values
  $: meta = item?._meta; // depth, index, path, isFirst, isLast
  $: children = item?.children;

  export let collection = null;

  export let expandedItems = null;
  $: expandable = children?.length;
  $: expanded = expandedItems?.includes(item.id);
  function expand(item) {
    expandedItems = [...expandedItems, item.id];
  }
  function tryCollapse(item) {
    const collapsed = !expandedItems.includes(item.id);
    if (!collapsed) expandedItems = expandedItems.filter(id => id !== item.id);
    return collapsed;
  }
  function toggle(item) {
    const collapsed = tryCollapse(item);
    if (collapsed) expand(item);
  }

  // function moveLeft() {
  //   if (canLeft) {
  //     const newPath = meta.path.slice(0, -1);
  //     newPath[newPath.length - 1]++;
  //     items = treeMoveItemToPath(items, item, newPath);
  //     saveAfterMove(items, meta.path, newPath);
  //   }
  // }
  // function moveRight() {
  //   if (canRight) {
  //     const prevPath = [...meta.path];
  //     prevPath[prevPath.length - 1]--;
  //     const prev = treeGetItemAtPath(items, prevPath);
  //     const newPath = [...prevPath, prev.children.length];
  //     items = treeMoveItemToPath(items, item, newPath);
  //     saveAfterMove(items, meta.path, newPath);
  //     expand(prev);
  //   }
  // }
  // function moveUp() {
  //   if (canUp) {
  //     const newPath = [...meta.path];
  //     newPath[newPath.length - 1]--;
  //     items = treeMoveItemToPath(items, item, newPath);
  //     saveAfterMove(items, meta.path, newPath);
  //   }
  // }
  // function moveDown() {
  //   if (canDown) {
  //     const newPath = [...meta.path];
  //     newPath[newPath.length - 1]++;
  //     items = treeMoveItemToPath(items, item, newPath);
  //     saveAfterMove(items, meta.path, newPath);
  //   }
  // }

  async function saveAfterMove(newItems, oldPath, newPath) {
    const getChildren = parent => {
      if (Array.isArray(parent)) return parent;
      return parent.children;
    };

    // as the items have just changed (and the item will get destroyed in the next tick)
    // we need to retrieve the item directly from the updated items
    const newItem = treeGetItemAtPath(newItems, newPath);

    // update the item's parent and index
    const { parent, index } = newItem;
    await api.items(collection).updateOne(item.id, { parent, index });

    // update indexes of old parent's children
    const oldParent = treeGetItemAtPath(items, oldPath.slice(0, -1));
    const oldChildren = getChildren(oldParent);
    const oldItemIndex = oldPath[oldPath.length - 1];
    await Promise.all(
      oldChildren
        .filter(child => child.index >= oldItemIndex) // `>=` is important - the moved items position has been filled
        .map(child => api.items(collection).updateOne(child.id, { index: child.index }))
    );

    // update indexes of new parent's children
    const newParent = treeGetItemAtPath(newItems, newPath.slice(0, -1));
    const newChildren = getChildren(newParent);
    const newItemIndex = newItem.index;
    await Promise.all(
      newChildren
        .filter(child => child.index > newItemIndex) // `>` is important - the moved item does not need an update
        .map(child => api.items(collection).updateOne(child.id, { index: child.index }))
    );

    socket.emitChanges(collection, item.id, false);
  }

  let dragging = false;
  export let showDropzonesItemID = null;
  $: showDropzones = item && showDropzonesItemID === item.id;
  $: showDropzoneParent = meta?.depth != 0 && meta?.isLast;
  $: showDropzoneSibling = !expanded;
  $: showDropzoneChild = true;
  let dropzoneHoverParent = false;
  let dropzoneHoverSibling = false;
  let dropzoneHoverChild = false;

  function dragstart(e) {
    dragging = true;
    e.dataTransfer.setData('path', meta.path);
    tryCollapse(item);
  }
  function dragover(e, type) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dropzoneHoverParent = type === 'P';
    dropzoneHoverSibling = type === 'S';
    dropzoneHoverChild = type === 'C';
  }
  function dragleave(e) {
    e.preventDefault();
    dropzoneHoverParent = false;
    dropzoneHoverSibling = false;
    dropzoneHoverChild = false;
  }
  function dragend(e) {
    e.preventDefault();
    dragging = false;
    showDropzones = false;
    dispatch('dragend');
  }
  function dragendBubble() {
    dispatch('dragend');
  }
  function drop(e, type) {
    e.preventDefault();
    dragging = false;
    showDropzones = false;
    dispatch('drop');
    const oldPath = e.dataTransfer.getData('path').split(',').map(Number);
    let newPath;
    if (type === 'P') {
      newPath = meta.path.slice(0, -1);
      newPath[newPath.length - 1]++;
    }
    if (type === 'S') {
      newPath = [...meta.path];
      newPath[newPath.length - 1]++;
    }
    if (type === 'C') {
      newPath = [...meta.path, 0];
    }
    console.log('itemPath before', JSON.stringify(meta.path));
    console.log('oldPath before', JSON.stringify(oldPath));
    console.log('newPath before', JSON.stringify(newPath));
    treeMoveItemToPath(items, oldPath, newPath);
    items = items;
    console.log('itemPath after', JSON.stringify(meta.path));
    console.log('oldPath after', JSON.stringify(oldPath));
    console.log('newPath after', JSON.stringify(newPath));

    // collapse the parent of the moved item if there are no more children in it
    const parent = treeGetItemAtPath(items, oldPath.slice(0, -1));
    if (parent && parent.children.length === 0) {
      tryCollapse(parent);
    }
    // saveAfterMove(items, newOldPath, newNewPath);
    // if (type === 'C') expand(item);
  }
  function dropBubble() {
    dispatch('drop');
  }
  function dragenterItem() {
    dispatch('dragenterItem', { id: item.id });
  }
  function dragenterItemBubble(id) {
    dispatch('dragenterItem', { id });
  }
</script>

{#if headRow}
  <div class="row row--head" style:grid-template-columns={widths}>
    {#if order}
      <div class="value value--head value--center">
        <div><div class="icon"><div><Icon name="text_bullet_list_add" dark /></div></div></div>
      </div>
    {/if}
    {#if hierarchy}
      <div class="value value--head value--center">
        <div><div class="icon"><div><Icon name="hierarchy" dark /></div></div></div>
      </div>
    {/if}
    {#each head as { checkbox, label, icon }}
      <div class="value value--head" class:center={checkbox}>
        <div>
          {#if icon}
            <div class="icon"><div><Icon name={icon} dark /></div></div>
          {/if}
          {#if label}{label}{/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

{#if item}
  <div
    class="row row--item"
    class:dragging
    style:grid-template-columns={widths}
    transition:slide={{ duration: order ? 200 : 0 }}
    on:dragenter={dragenterItem}
  >
    {#if order}
      <div
        class="value value--item value--center"
        on:click={() => {
          goto(`/admin/kategorie/+?parent=${item.id}&index=${item.children.length}`);
          expand(item);
        }}
      >
        <div><div class="icon"><div><Icon name="add" dark /></div></div></div>
      </div>
    {/if}
    {#if hierarchy}
      {@const width = ((maxDepth - meta.depth + 1) / (maxDepth + 1)) * 100}
      <div class="value value--item value--hierarchy" class:expandable>
        <div
          on:click={() => toggle(item)}
          style:margin-left={100 - width + '%'}
          style:width={width + '%'}
          class:border-left={meta.depth != 0}
          draggable={order}
          on:dragstart={dragstart}
          on:dragend={dragend}
        >
          {#if expandable}
            <div class="icon"><div><Icon name={expanded ? 'chevron_down' : 'chevron_right'} dark /></div></div>
          {:else}
            <div />
          {/if}
          {#if order}
            <div class="icon drag"><div><Icon name="drag" dark /></div></div>
          {/if}
        </div>
      </div>
    {/if}
    {#each row.values as value, i}
      {@const { checkbox, blame } = head[i]}
      <div
        class="value value--item"
        class:center={checkbox}
        class:blame
        on:click={() => {
          if (row.href) goto(row.href, { noScroll: true });
        }}
        on:mouseenter={e => {
          const table = e.target.parentNode.parentNode;
          const tableRect = table.getBoundingClientRect();
          const content = e.target.children[0];
          const contentRect = content.getBoundingClientRect();
          const isOut = contentRect.right > tableRect.right;
          if (isOut) {
            content.style.left = 'auto';
            content.style.right = '0';
          }
        }}
        on:mouseleave={e => {
          const content = e.target.children[0];
          content.style.left = '0';
          content.style.right = 'auto';
        }}
      >
        <div>
          {#if checkbox}
            {#if value}
              <Icon name="ok" color={'var(--primary)'} strokeWidth="1" />
            {:else}
              <Icon name="close" color={'var(--accent)'} />
            {/if}
          {:else if blame}
            <Blame {...value} />
          {:else}
            {value}
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

{#if showDropzones && !dragging}
  {@const hierarchyColumnWidth = hierarchyCellWidth * (maxDepth + 1)}
  {@const blankSpan = meta.depth - (showDropzoneParent ? 1 : 0) + (showDropzoneSibling ? 0 : 1)}
  {@const childSpan = maxDepth + 1 - blankSpan - (showDropzoneParent ? 1 : 0) - (showDropzoneSibling ? 1 : 0)}
  {@const blankWidth = blankSpan * hierarchyCellWidth}
  {@const parentWidth = hierarchyCellWidth}
  {@const siblingWidth = hierarchyCellWidth}
  {@const childWidth = (childSpan || 1) * hierarchyCellWidth}
  <div class="dropzones" in:slide={{ duration: 100 }} out:slide={{ duration: 300 }}>
    <div class="dropzone__blank" style:width={smallestCellWidth + 'rem'} />
    {#if blankSpan != 0}
      <div class="dropzone__blank" style:width={blankWidth + 'rem'} />
    {/if}
    {#if showDropzoneParent}
      <div
        class="dropzone"
        class:hover={dropzoneHoverParent}
        style:width={parentWidth + 'rem'}
        on:drop={e => drop(e, 'P')}
        on:dragover={e => dragover(e, 'P')}
        on:dragleave={dragleave}
      />
    {/if}
    {#if showDropzoneSibling}
      <div
        class="dropzone"
        class:hover={dropzoneHoverSibling}
        style:width={siblingWidth + 'rem'}
        on:drop={e => drop(e, 'S')}
        on:dragover={e => dragover(e, 'S')}
        on:dragleave={dragleave}
      />
    {/if}
    {#if showDropzoneChild}
      <div
        class="dropzone"
        class:hover={dropzoneHoverChild}
        style:width={childWidth + 'rem'}
        on:drop={e => drop(e, 'C')}
        on:dragover={e => dragover(e, 'C')}
        on:dragleave={dragleave}
      />
    {/if}
  </div>
{/if}

{#if !headRow && hierarchy && expanded}
  {#each children as child (child)}
    <svelte:self
      bind:items
      bind:expandedItems
      {head}
      {hierarchy}
      {order}
      {maxDepth}
      {widths}
      bind:item={child}
      {mapper}
      {collection}
      {showDropzonesItemID}
      on:drop={dropBubble}
      on:dragend={dragendBubble}
      on:dragenterItem={e => dragenterItemBubble(e.detail.id)}
    />
  {/each}
{/if}

<style>
  .row {
    cursor: pointer;
    display: grid;
    border-bottom: var(--border-light);
    height: 2rem;
  }
  .row--head {
    height: 2.5rem;
  }
  .row--item.dragging {
    opacity: 0.5;
  }

  .value {
    z-index: 0;
    overflow: hidden;
    position: relative;
    border-right: var(--border-light);
    min-width: 100%;
    height: 100%;
    background-color: var(--accent-white);
  }
  .value:last-child {
    border-right: none;
  }

  .value > div {
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    padding: 0 0.4rem;
    min-width: 100%;
    height: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    background-color: var(--light);
  }
  .value--head > div {
    background-color: var(--accent-white);
  }
  .row--item:hover > .value > div {
    background-color: var(--accent-light);
  }
  .value:hover {
    z-index: 1;
    overflow: visible;
  }
  .value:hover > div {
    outline: var(--border-light);
    outline-width: 2px;
  }

  .value > div .icon {
    display: flex;
    align-items: center;
    height: 100%;
  }
  .value > div .icon > div {
    height: 55%;
  }
  .value--center > div {
    justify-content: center;
  }

  .value--hierarchy:not(.expandable) > div {
    background-color: var(--accent-light);
  }
  .value--hierarchy > div {
    justify-content: space-between;
    min-width: auto;
  }
  .value--hierarchy > div.border-left {
    border-left: var(--border-light);
  }

  .drag {
    cursor: grab;
  }
  .dropzones {
    display: flex;
    height: 2rem;
  }
  /* .dropzone__blank,
  .dropzone {
    display: grid;
    place-items: center;
  } */
  .dropzone {
    --border: 1px solid var(--primary-light);
    height: 100%;
    background-color: var(--primary-white);
    border: var(--border);
    border-right: none;
  }
  .dropzone:last-of-type {
    border-right: var(--border);
  }
  .dropzone.hover {
    background-color: var(--primary-light);
  }
</style>
