<script>
  import { goto } from '$app/navigation';
  import { slide } from 'svelte/transition';

  import api from '$lib/api';
  import socket from '$lib/admin/heimdall';
  import { treeGetItemAtPath, treeMoveItemToPath } from '$lib/utils';

  import Icon from '$lib/common/Icon.svelte';
  import Blame from '$lib/admin/common/Blame.svelte';

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
  function collapse(item, expanded) {
    const itemExpanded = expanded || expandedItems.includes(item.id);
    if (itemExpanded) expandedItems = expandedItems.filter(id => id !== item.id);
  }
  function toggle(item) {
    const itemExpanded = expandedItems.includes(item.id);
    if (itemExpanded) collapse(item, itemExpanded);
    else expand(item);
  }

  $: canLeft = meta?.depth != 0;
  $: canRight = !(meta?.isFirst || (!maxDepth === 0 && meta?.depth === maxDepth));
  $: canUp = !meta?.isFirst;
  $: canDown = !meta?.isLast;

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
    for (const child of oldChildren) {
      // `>=` is important - the moved items position has been filled
      if (child.index >= oldItemIndex) {
        api.items(collection).updateOne(child.id, { index: child.index });
      }
    }

    // update indexes of new parent's children
    const newParent = treeGetItemAtPath(newItems, newPath.slice(0, -1));
    const newChildren = getChildren(newParent);
    const newItemIndex = newItem.index;
    for (const child of newChildren) {
      // `>` is important - the moved does not need an update
      if (child.index > newItemIndex) {
        api.items(collection).updateOne(child.id, { index: child.index });
      }
    }

    socket.emitChanges(collection, item.id, false);
  }

  function moveLeft() {
    if (canLeft) {
      const newPath = meta.path.slice(0, -1);
      newPath[newPath.length - 1]++;
      items = treeMoveItemToPath(items, item, newPath);
      saveAfterMove(items, meta.path, newPath);
    }
  }
  function moveRight() {
    if (canRight) {
      const prevPath = [...meta.path];
      prevPath[prevPath.length - 1]--;
      const prev = treeGetItemAtPath(items, prevPath);
      const newPath = [...prevPath, prev.children.length];
      items = treeMoveItemToPath(items, item, newPath);
      saveAfterMove(items, meta.path, newPath);
      expand(prev);
    }
  }
  function moveUp() {
    if (canUp) {
      const newPath = [...meta.path];
      newPath[newPath.length - 1]--;
      items = treeMoveItemToPath(items, item, newPath);
      saveAfterMove(items, meta.path, newPath);
    }
  }
  function moveDown() {
    if (canDown) {
      const newPath = [...meta.path];
      newPath[newPath.length - 1]++;
      items = treeMoveItemToPath(items, item, newPath);
      saveAfterMove(items, meta.path, newPath);
    }
  }
</script>

{#if headRow}
  <div class="row row--head" style:grid-template-columns={widths}>
    {#if hierarchy}
      <div class="value value--head value--center">
        <div><div class="icon"><div><Icon name="hierarchy" dark /></div></div></div>
      </div>
    {/if}
    {#if order}
      <div class="value value--head value--center">
        <div><div class="icon"><div><Icon name="arrow_left" dark /></div></div></div>
      </div>
      <div class="value value--head value--center">
        <div><div class="icon"><div><Icon name="arrow_right" dark /></div></div></div>
      </div>
      <div class="value value--head value--center">
        <div><div class="icon"><div><Icon name="arrow_up" dark /></div></div></div>
      </div>
      <div class="value value--head value--center">
        <div><div class="icon"><div><Icon name="arrow_down" dark /></div></div></div>
      </div>
    {/if}
    {#if hierarchy}
      <div class="value value--head value--center">
        <div><div class="icon"><div><Icon name="text_bullet_list_add" dark /></div></div></div>
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
  <div class="row row--item" style:grid-template-columns={widths} transition:slide={{ duration: order ? 200 : 0 }}>
    {#if hierarchy}
      {@const width = ((maxDepth + 1 - meta.depth) / (maxDepth + 1)) * 100}
      <div class="value value--item value--hierarchy" class:expandable>
        <div
          on:click={() => toggle(item)}
          style:margin-left={100 - width + '%'}
          style:width={width + '%'}
          class:border-left={meta.depth != 0}
        >
          {#if expandable}
            <div class="icon"><div><Icon name={expanded ? 'chevron_down' : 'chevron_right'} dark /></div></div>
          {/if}
        </div>
      </div>
    {/if}
    {#if order}
      <div class="value value--item value--center value--order" disabled={!canLeft} on:click={moveLeft}>
        <div><div class="icon"><div><Icon name="arrow_left" dark /></div></div></div>
      </div>
      <div class="value value--item value--center value--order" disabled={!canRight} on:click={moveRight}>
        <div><div class="icon"><div><Icon name="arrow_right" dark /></div></div></div>
      </div>
      <div class="value value--item value--center value--order" disabled={!canUp} on:click={moveUp}>
        <div><div class="icon"><div><Icon name="arrow_up" dark /></div></div></div>
      </div>
      <div class="value value--item value--center value--order" disabled={!canDown} on:click={moveDown}>
        <div><div class="icon"><div><Icon name="arrow_down" dark /></div></div></div>
      </div>
    {/if}
    {#if hierarchy}
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
    min-width: auto;
  }
  .value--hierarchy > div.border-left {
    border-left: var(--border-light);
  }
  .value--order[disabled='true'] .icon {
    display: none;
  }
</style>
