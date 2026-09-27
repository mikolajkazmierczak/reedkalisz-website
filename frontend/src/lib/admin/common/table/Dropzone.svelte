<script>
  import { slide } from 'svelte/transition';

  import { treeGetItemAtPath, treeMoveItemToPath } from '%/utils';
  import { addCellWidth, hierarchyCellWidth, saveAfterMove } from './utils';

  import Icon from '$c/Icon.svelte';

  export let collection;
  export let items;
  export let meta;
  export let maxDepth;
  export let expanded;
  export let tryCollapse;

  export let dropzone;
  export let dragging;
  export let dragged = null; // the path of the row being dragged (see Table)
  // the row this zone is under (-1: the head); it opens while a dragged row is over that row (dropzone === id)
  export let id;

  $: show = dropzone === id;
  let hoverParent = false;
  let hoverSibling = false;
  let hoverChild = false;

  // the head's drop zone (id -1) takes a row to the very first place, that's all it does
  $: head = id === -1;

  // where a slot puts the row: P(arent) - after this row's parent, S(ibling) - after this row (or first, the head's),
  // C(hild) - this row's first child
  function target(type) {
    if (type === 'P') {
      const path = meta.path.slice(0, -1);
      path[path.length - 1]++;
      return path;
    }
    if (type === 'S' && head) return [0];
    if (type === 'S') return [...meta.path.slice(0, -1), meta.path[meta.path.length - 1] + 1];
    if (type === 'C') return [...meta.path, 0];
  }
  // no slot that'd leave the dragged row where it is (worked out only for an open zone: the rows of a flat table have
  // no path)
  const moves = (type, dragged) => String(target(type)) !== dragged;
  $: parent = show && !head && meta.depth != 0 && meta.isLast && moves('P', dragged);
  $: sibling = show && (head || (!dragging && !expanded)) && moves('S', dragged);
  $: child = show && !head && !dragging && moves('C', dragged);

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

    const data = treeMoveItemToPath(items, oldPath, target(type));
    if (data) {
      const { oldItemData, newItemData } = data;
      await saveAfterMove(collection, items, oldItemData, newItemData);
      items = items;
    }
  }
</script>

{#if parent || sibling || child}
  {@const w = hierarchyCellWidth}
  {@const blankSpan = (meta?.depth ?? 0) - (parent ? 1 : 0)}
  {@const blankWidth = blankSpan * w}
  {@const parentWidth = w}
  {@const siblingWidth = (maxDepth + 1 - (meta?.depth ?? 0)) * w}
  {@const childWidth = w}
  <div class="dropzone" in:slide={{ duration: 100 }} out:slide={{ duration: 300 }}>
    <!-- under the "add a subcategory" column and the gap after it (see Grid), then the tree column -->
    <div class="blank" style:width="calc({addCellWidth} + var(--col-gap))" />
    {#if blankSpan != 0}
      <div class="blank" style:width={blankWidth + 'rem'} />
    {/if}

    {#if parent}
      <div
        class="slot"
        class:hover={hoverParent}
        style:width={parentWidth + 'rem'}
        role="group"
        aria-label="Upuść tutaj: poziom wyżej"
        on:drop={(e) => drop(e, 'P')}
        on:dragover={(e) => dragover(e, 'P')}
        on:dragleave={dragleave}>
        <div class="icon"><Icon fill name="arrow_left" color={'var(--navy-700)'} /></div>
      </div>
    {/if}

    {#if sibling}
      <div
        class="slot"
        class:hover={hoverSibling}
        style:width={siblingWidth + 'rem'}
        role="group"
        aria-label="Upuść tutaj: za tą pozycją"
        on:drop={(e) => drop(e, 'S')}
        on:dragover={(e) => dragover(e, 'S')}
        on:dragleave={dragleave} />
    {:else}
      <div class="blank" style:width={siblingWidth + 'rem'} />
    {/if}

    {#if child}
      <div
        class="slot"
        class:hover={hoverChild}
        style:width={childWidth + 'rem'}
        role="group"
        aria-label="Upuść tutaj: jako podkategoria"
        on:drop={(e) => drop(e, 'C')}
        on:dragover={(e) => dragover(e, 'C')}
        on:dragleave={dragleave}>
        <div class="icon"><Icon fill name="arrow_right" color={'var(--navy-700)'} /></div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .dropzone {
    display: flex;
    padding: 0 var(--cell-pad);
    height: 1.9rem;
  }
  .slot {
    position: relative;
    --border: 1px solid var(--navy-500);
    height: 100%;
    background-color: var(--navy-100);
    border: var(--border);
    border-right: none;
  }
  .slot:last-of-type {
    border-right: var(--border);
  }
  .slot.hover {
    background-color: var(--navy-500);
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
