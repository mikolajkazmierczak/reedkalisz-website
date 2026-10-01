<script>
  import { treeFlatten } from '%/utils';
  import Pagination from '@c/Pagination.svelte';
  import Select from '@c/Select.svelte';
  import { blameParts, defaultBlame } from '@c/Blame.svelte';
  import Dropzone from './Dropzone.svelte';
  import Grid from './Grid.svelte';
  import HeadIcon from './HeadIcon.svelte';
  import SortButton from './SortButton.svelte';
  import TableRow from './TableRow.svelte';
  import { draggingRow, getColumnWidths } from './utils';
  import { readSettings, writeSettings } from './settings';

  // A list of the admin, from data: `head` says the columns ({ label, icon, checkbox, blame, color, category, company,
  // thumb, float, width, sort }), `mapper` turns an item into { href, values } (and `hrefNew`, `codeNew` for "add a
  // subcategory"). Drawn in the Grid of every admin table; items with `children` make a tree, `order` lets them be
  // dragged into place.

  export let searchParams = null;
  export let limit = null;
  export let page = null;

  export let collection = null;
  export let itemsCount = null;
  export let items;
  export let head;
  export let mapper;

  export let order = false;
  // the list's filters beyond the page and sort (search, category...): another one scrolls it back up (see Grid)
  export let scrollKey = null;

  // The columns shown and what each blame column shows: picked in the head, kept in this browser per list, by the
  // columns' labels. At least one column stays, and a blame column shows at least one thing.
  $: settingsKey = searchParams?.pathname ?? collection;
  let hidden = [];
  let blames = {};
  $: load(settingsKey);
  function load(key) {
    ({ hidden, blame: blames } = readSettings(key));
  }
  function save() {
    writeSettings(settingsKey, { hidden, blame: blames });
  }
  // each column with its place among the values (`i`); none left (labels renamed): all of them
  $: allHead = head.map((h, i) => ({ ...h, i, show: blames[h.label] ?? defaultBlame }));
  $: visible = allHead.filter((h) => !hidden.includes(h.label));
  $: shownHead = visible.length ? visible : allHead;
  $: shownLabels = shownHead.map((h) => h.label);
  $: columnOptions = head.map(({ label }) => ({
    id: label,
    text: label,
    disabled: shownLabels.length === 1 && shownLabels[0] === label,
  }));
  function showColumns(labels) {
    hidden = head.map((h) => h.label).filter((label) => !labels.includes(label));
    save();
  }
  const blameOptions = (show) => blameParts.map((p) => ({ ...p, disabled: show.length === 1 && show[0] === p.id }));
  function showBlame(label, show) {
    blames = { ...blames, [label]: show };
    save();
  }

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

  $: tree = items.some((item) => item.children); // has children
  $: itemsFlat = tree ? treeFlatten(items) : items;
  $: maxDepth = tree ? itemsFlat.reduce((max, item) => Math.max(max, item._meta.path.length), 0) - 1 : 0;
  let expandedItems = []; // ids
  let dropzone = null; // id of the row a dragged one is over, -1 for the head
  let dragged = null; // the path of the row being dragged ("0,2")

  $: columns = getColumnWidths(shownHead, tree, order, maxDepth);
  // starting with text, not a tree's buttons nor a flag's icon: it's set in from the edge (see Grid)
  $: textFirst = !tree && !order && !shownHead[0]?.checkbox;
</script>

<Grid
  {columns}
  scrollKey={[page, limit, sort, scrollKey]}
  indentFirst={textFirst}
  empty={items.length ? null : 'Brak elementów o podanych parametrach'}
  on:dragenter={(e) => draggingRow(e) && (dropzone = -1)}>
  <svelte:fragment slot="head">
    {#if tree}<HeadIcon icon="text_bullet_list_add" label="Dodawanie podkategorii" />{/if}
    {#if tree || order}<HeadIcon icon="hierarchy" label="Hierarchia" />{/if}
    <!-- the last column ends with the columns menu -->
    {#each shownHead as { label, icon, sort: field, blame, show }, j (label)}
      <span class="cell">
        {#if icon}
          <HeadIcon {icon} {label} />
        {:else}
          <span class="label">{label ?? ''}</span>
          {#if field && sortable}
            <SortButton {label} active={sortField === field} desc={sortDesc} on:click={() => sortBy(field)} />
          {/if}
          {#if blame}
            <Select
              multiple
              search={false}
              icon="settings"
              title="{label}: co pokazać"
              value={show}
              options={blameOptions(show)}
              on:change={(e) => showBlame(label, e.detail.value)} />
          {/if}
        {/if}
        {#if j === shownHead.length - 1}
          <span class="columns">
            <Select
              multiple
              search={false}
              icon="column_triple"
              title="Kolumny"
              value={shownLabels}
              options={columnOptions}
              on:change={(e) => showColumns(e.detail.value)} />
          </span>
        {/if}
      </span>
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
      head={shownHead}
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
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /* the label, cut short if it must, and right after it its buttons */
  .cell {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .cell > :global(.head-icon) {
    flex: 1;
  }
  /* see columnsButtonWidth */
  .columns {
    flex: none;
    display: flex;
    margin-left: auto;
    padding-left: 0.4rem;
    border-left: solid 1px var(--black-10);
  }
</style>
