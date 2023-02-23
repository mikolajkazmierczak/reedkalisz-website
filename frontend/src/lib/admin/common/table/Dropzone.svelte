<script>
  import { slide } from 'svelte/transition';

  import { treeGetItemAtPath, treeMoveItemToPath } from '%/utils';
  import { smallestCellWidth, hierarchyCellWidth, saveAfterMove } from './utils';

  import Icon from '$c/Icon.svelte';

  export let collection;
  export let items;
  export let meta;
  export let maxDepth;
  export let expanded;
  export let tryCollapse;

  export let dropzone;
  export let dragging;
  export let id; // id of the item that is being dragged: -1 for headRow or item id for other rows

  $: show = dropzone === id;
  let hoverParent = false;
  let hoverSibling = false;
  let hoverChild = false;

  $: parent = meta?.depth != 0 && meta?.isLast;
  $: sibling = !dragging && !expanded;
  $: child = !dragging;

  function dragover(e, type) {
    // dragged element entered a slot
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    hoverParent = type === 'P';
    hoverSibling = type === 'S';
    hoverChild = type === 'C';
  }
  function dragleave(e) {
    // dragged element left a slot
    e.preventDefault();
    hoverParent = false;
    hoverSibling = false;
    hoverChild = false;
  }
  async function drop(e, type) {
    // dragged element was dropped into a slot
    e.preventDefault();
    dragging = false;
    dropzone = null;
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
    const data = treeMoveItemToPath(items, oldPath, newPath);
    if (data) {
      const { oldItemData, newItemData } = data;
      await saveAfterMove(collection, items, oldItemData, newItemData);
      items = items;
    }
  }
</script>

{#if show && (parent || sibling || child)}
  {@const w = hierarchyCellWidth}
  {@const blankSpan = meta.depth - (parent ? 1 : 0)}
  {@const blankWidth = blankSpan * w}
  {@const parentWidth = w}
  {@const siblingWidth = (maxDepth + 1 - meta.depth) * w}
  {@const childWidth = w}
  <div class="dropzone" in:slide={{ duration: 100 }} out:slide={{ duration: 300 }}>
    <div class="blank" style:width={smallestCellWidth + 'rem'} />
    {#if blankSpan != 0}
      <div class="blank" style:width={blankWidth + 'rem'} />
    {/if}

    {#if parent}
      <div
        class="slot"
        class:hover={hoverParent}
        style:width={parentWidth + 'rem'}
        on:drop={e => drop(e, 'P')}
        on:dragover={e => dragover(e, 'P')}
        on:dragleave={dragleave}
      >
        <div class="icon"><Icon name="arrow_left" color={'var(--primary)'} /></div>
      </div>
    {/if}

    {#if sibling}
      <div
        class="slot"
        class:hover={hoverSibling}
        style:width={siblingWidth + 'rem'}
        on:drop={e => drop(e, 'S')}
        on:dragover={e => dragover(e, 'S')}
        on:dragleave={dragleave}
      />
    {:else}
      <div class="blank" style:width={siblingWidth + 'rem'} />
    {/if}

    {#if child}
      <div
        class="slot"
        class:hover={hoverChild}
        style:width={childWidth + 'rem'}
        on:drop={e => drop(e, 'C')}
        on:dragover={e => dragover(e, 'C')}
        on:dragleave={dragleave}
      >
        <div class="icon"><Icon name="arrow_right" color={'var(--primary)'} /></div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .dropzone {
    display: flex;
    height: 2rem;
  }
  .slot {
    position: relative;
    --border: 1px solid var(--primary-light);
    height: 100%;
    background-color: var(--primary-white);
    border: var(--border);
    border-right: none;
  }
  .slot:last-of-type {
    border-right: var(--border);
  }
  .slot.hover {
    background-color: var(--primary-light);
  }
  .icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    width: 100%;
    height: 60%;
  }
</style>
