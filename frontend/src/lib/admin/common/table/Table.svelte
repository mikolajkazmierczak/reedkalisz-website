<script>
  import { treeFlatten } from '%/utils';
  import Icon from '$c/Icon.svelte';
  import Pagination from '@c/Pagination.svelte';
  import Dropzone from './Dropzone.svelte';
  import Grid from './Grid.svelte';
  import HeadIcon from './HeadIcon.svelte';
  import TableRow from './TableRow.svelte';
  import { draggingRow, getColumnWidths } from './utils';

  // A list of the admin, from data: `head` says the columns ({ label, icon, checkbox, blame, color, category, float,
  // width, sort }), `mapper` turns an item into { href, values } (and `hrefNew`, `codeNew` for "add a subcategory"). Drawn in
  // the Grid of every admin table; items with `children` make a tree, `order` lets them be dragged into place.

  export let searchParams = null;
  export let limit = null;
  export let page = null;

  export let collection = null;
  export let itemsCount = null;
  export let items;
  export let head;
  export let mapper;

  export let order = false;

  // Sorted by one column at a time, in the url (`s`: 'name', '-date_created'; see searchparams.js): a column with
  // `sort` (the field, e.g. 'company.name') gets a button beside its label - up, down, then back to `defaultSort`
  // (the list's own order: null when it has none). Not for a list dragged into order (a tree).
  export let sort = null;
  export let defaultSort = null;
  $: current = sort ?? defaultSort;
  $: sortField = current?.replace(/^-/, '');
  $: sortDesc = !!current?.startsWith('-');
  $: sortable = !!searchParams && !order;
  function sortBy(field) {
    let next = sortField !== field ? field : sortDesc ? null : `-${field}`;
    if (next === defaultSort) next = null;
    else if (next === null && current === defaultSort) next = field; // (the default's own column: just turned around)
    searchParams.set({ s: next, p: 1 });
  }
  $: sortTitle = (field) =>
    sortField !== field ? 'Sortuj rosnąco' : sortDesc ? 'Sortowane malejąco' : 'Sortowane rosnąco';

  $: tree = items.some((item) => item.children); // has children
  $: itemsFlat = tree ? treeFlatten(items) : items;
  $: maxDepth = tree ? itemsFlat.reduce((max, item) => Math.max(max, item._meta.path.length), 0) - 1 : 0;
  let expandedItems = []; // ids
  let dropzone = null; // id of the row a dragged one is over, -1 for the head
  let dragged = null; // the path of the row being dragged ("0,2")

  $: columns = getColumnWidths(head, tree, order, maxDepth);
  // starting with text, not a tree's buttons nor a flag's icon: it's set in from the edge (see Grid)
  $: textFirst = !tree && !order && !head[0]?.checkbox;
</script>

<Grid
  {columns}
  indentFirst={textFirst}
  empty={items.length ? null : 'Brak elementów o podanych parametrach'}
  on:dragenter={(e) => draggingRow(e) && (dropzone = -1)}>
  <svelte:fragment slot="head">
    {#if tree}<HeadIcon icon="text_bullet_list_add" label="Dodawanie podkategorii" />{/if}
    {#if tree || order}<HeadIcon icon="hierarchy" label="Hierarchia" />{/if}
    {#each head as { label, icon, sort: field }}
      {#if icon}
        <HeadIcon {icon} {label} />
      {:else if field && sortable}
        {@const active = sortField === field}
        <span class="sortable">
          <span class="label">{label ?? ''}</span>
          <button
            class="sort"
            class:active
            title={sortTitle(field)}
            aria-label="{label}: {sortTitle(field).toLowerCase()}"
            on:click={() => sortBy(field)}>
            <Icon
              fill
              name={active ? (sortDesc ? 'arrow_sort_down' : 'arrow_sort_up') : 'arrow_sort'}
              color="currentColor"
              strokeWidth={0.3} />
          </button>
        </span>
      {:else}
        <span class="label">{label ?? ''}</span>
      {/if}
    {/each}
  </svelte:fragment>

  {#if order}
    <!-- a row dragged onto the head goes first -->
    <Dropzone {collection} bind:items {maxDepth} tryCollapse={() => {}} bind:dropzone {dragged} id={-1} />
  {/if}
  <!-- by id: a list read again (after every change heimdall reports) keeps its rows -->
  {#each items as item (item.id)}
    <TableRow
      {collection}
      {head}
      bind:items
      bind:item
      {mapper}
      {order}
      {tree}
      {maxDepth}
      bind:expandedItems
      bind:dropzone
      bind:dragged />
  {/each}
</Grid>

{#if itemsCount != -1}
  <Pagination {searchParams} bind:limit bind:page count={itemsCount} />
{/if}

<style>
  .label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /* the label, cut short if it must, and right after it its button: small, grey as the head, navy when it's the one */
  .sortable {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .sort {
    cursor: pointer;
    flex: none;
    display: grid;
    place-items: center;
    width: 1.2rem;
    height: 1.2rem;
    padding: 0.15rem;
    border: none;
    border-radius: 0.4rem;
    corner-shape: squircle;
    color: var(--grey-500);
    background-color: transparent;
  }
  /* the admin gives every element its own text colour, so the icon takes the button's */
  .sort :global(svg),
  .sort :global(use) {
    color: inherit;
  }
  .sort:hover {
    color: var(--navy-700);
    background-color: var(--black-6);
  }
  .sort.active {
    color: var(--light);
    background-color: var(--navy-700);
  }
</style>
