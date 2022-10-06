<script>
  // import { onMount } from 'svelte';
  // import Sortable from 'sortablejs';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  import { goto } from '$app/navigation';
  import { slide } from 'svelte/transition';
  import { treeMoveItemToPath, treeGetItemAtPath } from '$lib/utils';

  import Icon from '$lib/common/Icon.svelte';
  import Input from '$lib/admin/input/Input.svelte';
  import Blame from '$lib/admin/common/Blame.svelte';

  export let headRow = false;
  export let head;
  export let items;

  export let hierarchy = false;
  export let order = false;
  export let maxDepth = 0;
  export let widths;

  export let item = null;
  export let mapper = null;
  $: row = item ? mapper(item) : null; // href, values
  $: meta = item?._meta; // depth, index, path, isFirst, isLast
  $: children = item?.children;

  export let expandedItems = null;
  $: expandable = children?.length;
  $: expanded = expandedItems?.includes(item.id);
  function toggle() {
    if (expanded) expandedItems = expandedItems.filter(id => id !== item.id);
    else if (expandable) expandedItems = [...expandedItems, item.id];
  }

  // export let dragging = false;
  // export let dragged = null;
  // let wrapper = null;
  // let sortable = null;
  // export let sortableConfig = null;
  // onMount(() => {
  //   if (!headRow) new Sortable.create(sortable, sortableConfig);
  // });
  // $: padded =
  //   dragging && (dragged?.previousElementSibling === wrapper || dragged?.parentElement === wrapper.children[1]);
  // // $: console.log(row?.values[2], padded);

  // // $: console.log(dragged);
  // $: console.log(maxDepth);
</script>

{#if headRow}
  <div class="row row--head" style:grid-template-columns={widths}>
    {#if hierarchy}
      <div class="value value--head value--center">
        <div><div class="icon"><div><Icon name="hierarchy" dark /></div></div></div>
      </div>
    {/if}
    {#if order}
      <div class="value value--head">
        <div><div class="icon"><div><Icon name="arrow_left" dark /></div></div></div>
      </div>
      <div class="value value--head">
        <div><div class="icon"><div><Icon name="arrow_right" dark /></div></div></div>
      </div>
      <div class="value value--head">
        <div><div class="icon"><div><Icon name="arrow_up" dark /></div></div></div>
      </div>
      <div class="value value--head">
        <div><div class="icon"><div><Icon name="arrow_down" dark /></div></div></div>
      </div>
    {/if}
    {#each head as { checkbox, label, icon }}
      <div
        class="value value--head"
        class:center={checkbox}
        on:click={() => {
          // TODO: change sorting
        }}
      >
        <div>
          {#if icon}<div class="icon"><div><Icon name={icon} dark /></div></div>{/if}
          {#if label}{label}{/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

<!-- <div class="row-wrapper" bind:this={wrapper} data-id={item?.id}> -->
<!-- <div class="row-wrapper"> -->
{#if item}
  <div class="row row--item" style:grid-template-columns={widths} transition:slide={{ duration: 200 }}>
    {#if hierarchy}
      {@const width = ((maxDepth + 1 - meta.depth) / (maxDepth + 1)) * 100}
      <!-- {width} -->
      <div class="value value--item value--hierarchy" class:expandable>
        <div
          on:click={toggle}
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
      <div
        class="value value--item value--order"
        disabled={meta.depth == 0}
        on:click={() => {
          const newPath = [...meta.path];
          newPath.pop();
          newPath[newPath.length - 1]++;
          treeMoveItemToPath(items, item, newPath);
          dispatch('update');
        }}
      >
        <div><div class="icon"><div><Icon name="arrow_left" dark /></div></div></div>
      </div>
      <div
        class="value value--item value--order"
        disabled={meta.isFirst || (!maxDepth === 0 && meta.depth === maxDepth)}
        on:click={() => {
          const prevPath = [...meta.path];
          prevPath[prevPath.length - 1]--;
          console.log(meta.path, prevPath);

          const prev = treeGetItemAtPath(items, prevPath);
          console.log(prev);
          const newPath = [...meta.path, prev.children.length];
          console.log(meta.path, newPath);
          treeMoveItemToPath(items, item, newPath);
          dispatch('update');
        }}
      >
        <div><div class="icon"><div><Icon name="arrow_right" dark /></div></div></div>
      </div>
      <div class="value value--item value--order" disabled={meta.isFirst}>
        <div><div class="icon"><div><Icon name="arrow_up" dark /></div></div></div>
      </div>
      <div class="value value--item value--order" disabled={meta.isLast}>
        <div><div class="icon"><div><Icon name="arrow_down" dark /></div></div></div>
      </div>
    {/if}

    {#each row.values as value, i}
      {@const { checkbox, blame } = head[i]}
      <div
        class="value value--item"
        class:center={checkbox}
        class:blame
        on:click={() => {
          if (checkbox) value = !value;
          else if (row.href) goto(row.href);
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
            <Input type="checkbox" {value} />
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
<!-- </div> -->

{#if !headRow}
  <!-- <div class="children" bind:this={sortable} class:padded data-depth={meta.depth}> -->
  <!-- <div class="children"> -->
  {#if expanded}
    {#each children as child}
      <svelte:self
        {head}
        {items}
        {hierarchy}
        {order}
        {maxDepth}
        {widths}
        item={child}
        {mapper}
        bind:expandedItems
        on:update={() => dispatch('update')}
      />
    {/each}
  {/if}
  <!-- {dragging}
            {dragged}
            {sortableConfig} -->
  <!-- </div> -->
{/if}

<style>
  /* .children {
    background-color: var(--primary-white);
    transition: padding 0.2s;
  }
  .children.padded {
    padding: 1rem;
  } */

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
  .value.center > div {
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
  /* .value--hierarchy:hover > div.border-left {
    border-left: none;
  } */
  /* .value--hierarchy > div.dragging {
    padding: 0;
    width: 100%;
    background-color: var(--primary-white);
  }
  .row--item:hover > .value--hierarchy > .dragging {
    background-color: var(--primary);
  } */
  .value--order > div {
    justify-content: center;
  }
  .value--order[disabled='true'] .icon {
    display: none;
  }
</style>
