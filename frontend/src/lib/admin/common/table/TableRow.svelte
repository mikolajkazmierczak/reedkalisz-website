<script>
  import { swatch, colorMissing, COLOR_KINDS } from '$/colors';
  import { goto } from '$app/navigation';

  import Icon from '$c/Icon.svelte';
  import Blame from '@c/Blame.svelte';
  import Button from '@c/Button.svelte';
  import CategoryCode from '@c/CategoryCode.svelte';
  import CompanyIcon from '@c/CompanyIcon.svelte';
  import Thumb from '@c/Thumb.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import Dropzone from './Dropzone.svelte';
  import { draggingRow, hierarchyCellWidth } from './utils';
  import Float from './Float.svelte';

  // A row of Table (a `.row` of the Grid), then the drop zone under it, then its children when it's open.
  export let collection = null;
  export let head; // the columns shown, each with its place among the row's values (`i`, see Table)

  export let items = null;
  export let item = null;
  export let mapper = null;
  $: row = mapper(item); // href, values, warn (something to look at: an unread question, a colour without its value),
  // and in a tree: hrefNew, codeNew (a new subcategory's link and number, for the add button)
  $: meta = item._meta; // depth, index, path, isFirst, isLast
  $: children = item.children;

  export let order = false;
  export let tree = false;
  export let maxDepth;

  export let expandedItems = null;
  $: expandable = children?.length;
  $: expanded = expandedItems?.includes(item.id);

  function expand(item) {
    expandedItems = [...expandedItems, item.id];
  }
  function tryCollapse(item) {
    const collapsed = !expandedItems.includes(item.id);
    if (!collapsed) expandedItems = expandedItems.filter((id) => id !== item.id);
    return collapsed;
  }
  function toggle(item) {
    const collapsed = tryCollapse(item);
    if (collapsed) expand(item);
  }

  export let dropzone = null;
  export let dragged = null; // see Table
  let dragging = false;

  function dragstart(e) {
    dragging = true;
    dragged = String(meta.path);
    e.dataTransfer.setData('path', meta.path);
    tryCollapse(item);
  }
  function dragend(e) {
    e.preventDefault();
    dragging = false;
    dropzone = null;
    dragged = null;
  }
  function dragenter(e) {
    // the dragged row is over this one: its drop zone opens
    if (draggingRow(e)) dropzone = item.id;
  }

  // a click anywhere but the tree's buttons opens the item, so does Enter on the row itself
  function open(e) {
    if (row.href && !e.target.closest('button, .hierarchy')) goto(row.href, { noScroll: true });
  }
  function openByKey(e) {
    if (e.key === 'Enter' && e.target === e.currentTarget) open(e);
  }
  // the tree's arrow from the keyboard
  function toggleByKey(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    toggle(item);
  }
</script>

<div
  class="row"
  class:clickable={row.href}
  class:warn={row.warn}
  class:dragging
  role="link"
  tabindex="0"
  on:dragenter={dragenter}
  on:click={open}
  on:keydown={openByKey}>
  {#if tree}
    <span class="center tree-cell add">
      <span class="add__button">
        <Button
          size="sm"
          dashed
          icon="add"
          label="Dodaj podkategorię {row.codeNew ?? ''}"
          on:click={() => {
            goto(row.hrefNew);
            expand(item);
          }} />
        <Tooltip
          >Dodaj podkategorię {#if row.codeNew}<CategoryCode code={row.codeNew} />{/if}</Tooltip>
      </span>
    </span>
  {/if}
  {#if tree || order}
    <!-- the deeper, the further right it starts; the arrow opens it, the dots drag it -->
    {@const width = ((maxDepth - (meta.depth ?? 0) + 1) / (maxDepth + 1)) * 100}
    <span class="hierarchy tree-cell" class:expandable>
      <span
        class="hierarchy__bar"
        class:nested={meta.depth != 0}
        style:margin-left={100 - width + '%'}
        style:width={width + '%'}
        style:--level={hierarchyCellWidth + 'rem'}
        draggable={order}
        role="button"
        tabindex="0"
        aria-label={expandable ? (expanded ? 'Zwiń' : 'Rozwiń') : 'Przeciągnij'}
        aria-expanded={expandable ? expanded : undefined}
        on:click={() => toggle(item)}
        on:keydown={toggleByKey}
        on:dragstart={dragstart}
        on:dragend={dragend}>
        <span class="arrow">
          {#if expandable}
            <span class="icon"><Icon fill name={expanded ? 'chevron_down' : 'chevron_right'} dark /></span>
          {/if}
        </span>
        {#if order}
          <span class="icon drag"><Icon fill name="drag" dark /></span>
        {/if}
      </span>
    </span>
  {/if}
  {#each head as { i, checkbox, blame, show, color, category, company, thumb, float: floating } (i)}
    {@const value = row.values[i]}
    {#if checkbox}
      <span class="center">
        <span class="check">
          {#if value}
            <Icon fill name="ok" color={'var(--navy-700)'} strokeWidth="1" />
          {:else}
            <Icon fill name="close" color={'var(--grey-300)'} />
          {/if}
        </span>
      </span>
    {:else if thumb}
      <!-- { thumb, text }: a product's picture (as tall as the cell, outside the text's line: it'd be cut there) before
           its name -->
      <span class="ui-thumbed">
        <Thumb file={value.thumb} size="1.5rem" zoom blank />
        <Float enabled={!!floating}>{value.text}</Float>
      </span>
    {:else}
      <!-- `float` in the column's head: its text, when cut, shows whole on hover -->
      <Float enabled={!!floating} fade={!!blame}>
        {#if blame}
          <Blame {...value} {show} />
        {:else if category}
          <!-- { code, name } -->
          <CategoryCode code={value.code} />
          {value.name}
        {:else if company}
          <CompanyIcon company={value} />
          {value}
        {:else if color}
          <!-- the whole colour: { color, multicolor, transparent, wood, neutral } -->
          <span class="color" class:missing={colorMissing(value)} style:background={swatch(value, null)} />
          {#if value?.color}<span>{value.color}</span
            >{/if}{#each COLOR_KINDS.filter(([key]) => value?.[key]) as [, kind]}<span class="pill">{kind}</span>{/each}
        {:else}
          {value}
        {/if}
      </Float>
    {/if}
  {/each}
</div>

<Dropzone
  {collection}
  bind:items
  {meta}
  {maxDepth}
  {expanded}
  {tryCollapse}
  bind:dropzone
  bind:dragging
  {dragged}
  id={item.id} />

{#if tree && expanded}
  {#each children as child (child.id)}
    <svelte:self
      {collection}
      {head}
      bind:items
      bind:item={child}
      {mapper}
      {order}
      {tree}
      {maxDepth}
      bind:expandedItems
      bind:dropzone
      bind:dragged />
  {/each}
{/if}

<style>
  .row {
    font-size: 0.95rem;
  }
  .center {
    display: flex;
    justify-content: center;
  }
  .check {
    display: flex;
    height: 1rem;
    aspect-ratio: 1 / 1;
  }

  /* the tree's columns are grey like the head, the whole height of the row; the bar starts further right the deeper
     the item is, so its level shows as grey to its left */
  .tree-cell {
    align-self: stretch;
    display: flex;
    align-items: center;
    margin: calc(-1 * var(--row-pad)) 0;
    background-color: var(--grey-100);
  }
  /* from the row's edge up to the tree column, over the padding and the gap, the button in its middle (see
     addCellWidth) */
  .tree-cell.add {
    margin-left: calc(-1 * var(--cell-pad));
    margin-right: calc(-1 * var(--col-gap));
    padding: 0 var(--row-pad);
  }
  .add__button {
    display: flex;
  }
  .hierarchy {
    align-items: stretch;
  }
  .hierarchy__bar {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 0.2rem;
    border-radius: var(--border-radius) 0 0 var(--border-radius);
    corner-shape: squircle;
    background-color: var(--light);
  }
  /* the arrow in the middle of its level's part of the column */
  /* (it gives way at the deepest level: the bar is a level wide there, and has no arrow) */
  .arrow {
    display: flex;
    justify-content: center;
    width: var(--level);
  }
  .hierarchy:not(.expandable) .hierarchy__bar {
    background-color: var(--blue-100); /* solid: it lies on the grey column */
  }
  /* it's a button (it opens the item's children, it drags it): it lights up under the pointer, in the colour of the
     slots it's dropped into (see Dropzone) */
  .hierarchy .hierarchy__bar:hover {
    background-color: var(--navy-100);
  }
  .hierarchy__bar:focus-visible {
    outline: solid 2px var(--navy-700);
    outline-offset: -2px;
  }
  .hierarchy__bar.nested {
    border-left: solid 1px var(--black-10);
  }
  .icon {
    display: flex;
    height: 1rem;
    aspect-ratio: 1 / 1;
  }
  .drag {
    cursor: grab;
  }
  .dragging {
    opacity: 0.5;
  }

  /* what else a colour is, as a pill (like a Blame's) */
  .pill {
    display: inline-block;
    border-radius: 100rem;
    padding: 0.15em 0.5em;
    font-size: 0.8em;
    background-color: var(--black-10);
  }
  /* apart from the hex or another pill before it (right after the swatch, it's the swatch's gap) */
  :not(.color) + .pill {
    margin-left: 0.3rem;
  }
  /* round like the website's; its edge is a ring drawn over the colour, not a border: under a border the colour (the
     multicolour's quarters) starts inside it and repeats underneath, so it wouldn't reach the edge */
  .color {
    display: inline-block;
    vertical-align: middle;
    margin-right: 0.4rem;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px var(--black-20);
    height: 1.25rem; /* the website's (its Color) */
    aspect-ratio: 1 / 1;
  }
  /* no colour yet: an empty dashed circle (the menu asks for it too) */
  .color.missing {
    box-shadow: none;
    border: dashed 1px var(--orange-500);
  }
</style>
