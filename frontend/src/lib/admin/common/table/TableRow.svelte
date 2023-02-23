<script>
  import { goto } from '$app/navigation';

  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import Blame from '@c/Blame.svelte';
  import Dropzone from './Dropzone.svelte';

  export let collection = null;
  export let headRow = false;
  export let head;

  export let items = null;
  export let item = null;
  export let mapper = null;
  $: row = item ? mapper(item) : null; // href, values
  $: meta = item?._meta; // depth, index, path, isFirst, isLast
  $: children = item?.children;

  export let order = false;
  export let tree = false;
  export let maxDepth;
  export let widths;

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

  export let dropzone = null;
  let dragging = false;

  function dragstart(e) {
    // dragging started
    dragging = true;
    e.dataTransfer.setData('path', meta.path);
    tryCollapse(item);
  }
  function dragend(e) {
    // dragging stopped
    e.preventDefault();
    dragging = false;
    dropzone = null;
  }

  function dragenter() {
    // dragged element entered a row
    dropzone = item.id;
  }
</script>

{#if headRow}
  <div class="row row--head" style:grid-template-columns={widths}>
    {#if tree}
      <div class="value value--head value--center">
        <div>
          <Tooltip label="Dodawanie podkategorii" />
          <div class="icon"><div><Icon name="text_bullet_list_add" dark /></div></div>
        </div>
      </div>
    {/if}
    {#if tree || order}
      <div class="value value--head value--center">
        <div>
          <Tooltip label="Hierarchia" />
          <div class="icon"><div><Icon name="hierarchy" dark /></div></div>
        </div>
      </div>
    {/if}
    {#each head as { checkbox, label, icon }}
      <div class="value value--head" class:center={checkbox}>
        <div>
          {#if icon}
            {#if label}<Tooltip {label} />{/if}
            <div class="icon"><div><Icon name={icon} dark /></div></div>
          {:else if label}
            {label}
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

{#if item}
  <div class="row row--item" class:dragging style:grid-template-columns={widths} on:dragenter={dragenter}>
    {#if tree}
      <div
        class="value value--item value--center"
        on:click={() => {
          goto(row.hrefNew);
          expand(item);
        }}
      >
        <div><div class="icon"><div><Icon name="add" dark /></div></div></div>
      </div>
    {/if}
    {#if tree || order}
      {@const width = ((maxDepth - (meta.depth ?? 0) + 1) / (maxDepth + 1)) * 100}
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
      {@const { checkbox, blame, color } = head[i]}
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
            {#if color}<div class="color" style:background-color={value} />{/if}
            {value}
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

{#if headRow || item}
  <Dropzone
    {collection}
    bind:items
    {meta}
    {maxDepth}
    {expanded}
    {tryCollapse}
    bind:dropzone
    bind:dragging
    id={headRow ? -1 : item.id}
  />
{/if}

{#if !headRow && tree && expanded}
  {#each children as child (child)}
    <svelte:self
      {collection}
      {head}
      bind:items
      bind:item={child}
      {mapper}
      {order}
      {tree}
      {maxDepth}
      {widths}
      bind:expandedItems
      bind:dropzone
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
    justify-content: space-between;
    min-width: auto;
  }
  .value--hierarchy > div.border-left {
    border-left: var(--border-light);
  }

  .color {
    margin-right: 0.4rem;
    border-radius: 0.2rem;
    border: var(--border-light);
    height: 60%;
    aspect-ratio: 1 / 1;
  }

  .drag {
    cursor: grab;
  }
  .dragging {
    opacity: 0.5;
  }
</style>
