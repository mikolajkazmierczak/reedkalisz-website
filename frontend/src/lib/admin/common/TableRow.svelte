<script>
  import { goto } from '$app/navigation';
  import { slide } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  import api from '$/api';
  import socket from '$/heimdall';
  import { treeGetItemAtPath, treeMoveItemToPath } from '$/utils';

  import Icon from '$c/Icon.svelte';
  import Blame from '@c/Blame.svelte';

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

  async function saveAfterMove(newItems, oldPath, newPath) {
    function getItemsToUpdate(newItems, path, startIndex) {
      const item = treeGetItemAtPath(newItems, path);
      console.log('item', item);
      const children = item.children ?? item; // root edge case
      console.log('item?.children', item?.children);
      console.log('children', children);
      const indexes = children.filter(c => c.index >= startIndex).map(c => c.index);
      console.log('indexes', indexes);
      return { children, indexes };
    }

    // as the items have just changed (and the item will get destroyed in the next tick)
    // we need to retrieve the item directly from the updated items
    const movedItem = treeGetItemAtPath(newItems, newPath);

    // update the new item's parent and index
    const { parent, index } = movedItem;
    await api.items(collection).updateOne(movedItem.id, { parent, index });

    // update indexes of both parent's children
    const newParentPath = newPath.slice(0, -1);
    const oldParentPath = oldPath.slice(0, -1);
    const newIndex = newPath[newPath.length - 1];
    const oldIndex = oldPath[oldPath.length - 1];
    const sameParent = newParentPath.join('') == oldParentPath.join('');
    if (sameParent) {
      if (newIndex == oldIndex) return;
      const startIndex = newIndex > oldIndex ? oldIndex : newIndex + 1;
      // get indexes of parent's children and update them
      const { children, indexes } = getItemsToUpdate(newItems, newParentPath, startIndex);
      await Promise.all(indexes.map(i => api.items(collection).updateOne(children[i].id, { index: i })));
    } else {
      // get indexes of new parent's children, old parent's children and update both
      const { children: newChildren, indexes: newIndexes } = getItemsToUpdate(newItems, newParentPath, newIndex + 1);
      const { children: oldChildren, indexes: oldIndexes } = getItemsToUpdate(newItems, oldParentPath, oldIndex);
      await Promise.all([
        ...newIndexes.map(i => api.items(collection).updateOne(newChildren[i].id, { index: i })),
        ...oldIndexes.map(i => api.items(collection).updateOne(oldChildren[i].id, { index: i }))
      ]);
    }

    socket.emitChanges(collection, movedItem.id, false); // TODO: emit changes for all updated items
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

    // if this element is the last child of its parent (and not the root list), we need to collapse it
    const parent = treeGetItemAtPath(items, oldPath.slice(0, -1));
    if (!Array.isArray(parent) && parent.children.length == 1) tryCollapse(parent);

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
    treeMoveItemToPath(items, oldPath, newPath);
    items = items;

    saveAfterMove(items, oldPath, newPath);
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
