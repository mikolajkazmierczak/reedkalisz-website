<script>
  // The frame of every admin table, a ledger: a head row ruled off in the ink, compact rows ruled faintly, lit grey
  // on hover, no lines between the columns.
  // The head and every row share one grid, `columns` (css grid-template-columns). Rows are the default slot, each a
  // `.row` (`.selected` to mark one, `.clickable` for a row that opens something); `empty` is said when there are none.
  // The API tabs fill it by hand, the lists of the admin through Table (from `head` and `mapper`).
  export let columns;
  export let empty = null;
  // what's asked of the list (its page, sort, search, filters): another one scrolls it back to the top - not the rows
  // themselves, which change with every refresh (heimdall), where it stays
  export let scrollKey = null;

  let table;
  let lastKey;
  $: resetScroll(scrollKey);
  function resetScroll(key) {
    const k = JSON.stringify(key);
    if (lastKey !== undefined && k !== lastKey && table) table.scrollTop = 0;
    lastKey = k;
  }
</script>

<div class="table ui-on-mat" style:--columns={columns} bind:this={table}>
  <!-- as wide as the table, wider only when the columns' minimums don't fit: the head goes on while scrolling -->
  <div class="grid">
    <div class="head" role="presentation" on:dragenter><slot name="head" /></div>
    <slot />
    {#if empty}
      <p class="empty">{empty}</p>
    {/if}
  </div>
</div>

<style>
  /* A ledger on the mat: each row a cell tall with its rule, the head a pixel less (the table's top edge makes it up),
     the last row two (its bottom edge and the pixel it sits inside its slot), so every rule lies on a line of the mat
     and the table's slot is whole cells - tight: the lists are long, as much as possible should fit on the screen. A
     row's lines (a wrapping cell) a cell apart too */
  .table {
    --row-pad: calc((var(--cell) - 1px - 1.5rem) / 2); /* round a line of 1.5rem (a small button) in a row */
    --cell-pad: var(--box-pad); /* (its first and last cells' content as far in as a box's) */
    --col-gap: 0.4rem;
    --row-border: solid 1px var(--ledger-rule); /* fainter than its frame */
    overflow: auto; /* sideways when the columns don't fit, down when the page gives it less than its rows (.ui-fill) */
    border-radius: var(--box-radius);
    corner-shape: squircle;
    border: var(--border-light);
    background-color: var(--paper);
    box-shadow: var(--shadow);
  }
  .grid {
    width: fit-content;
    min-width: 100%;
  }
  .head,
  .table :global(.row) {
    display: grid;
    grid-template-columns: var(--columns);
    gap: calc(var(--cell) - 1.5rem) var(--col-gap);
    align-items: center;
    padding: var(--row-pad) var(--cell-pad);
    min-height: var(--cell);
  }
  /* a cell's content may be cut (see Float), never widen the column */
  .table :global(.row > *),
  .head > :global(*) {
    min-width: 0;
  }
  /* stays at the top of a table that scrolls (see .ui-fill), over the rows (and a floating cell, see Float) */
  .head {
    z-index: 3;
    position: sticky;
    top: 0;
    --row-pad: calc((var(--cell) - 2px - 1.5rem) / 2); /* (a pixel less, see above: a small button still fits) */
    min-height: calc(var(--cell) - 1px);
    border-bottom: solid 1px rgb(27 47 78 / 0.3); /* on the rows' own paper, ruled off from them in the ink */
    font-size: 0.8rem;
    font-weight: 600;
    background-color: var(--paper);
  }
  /* --row-bg: the row's colour, for what fades into it (see Float) */
  .table :global(.row) {
    --row-bg: var(--paper);
    border-bottom: var(--row-border);
  }
  /* two pixels less (see above): its padding, and what fills a row to its edges (a tree cell, Float), less too */
  .table :global(.row:last-child) {
    --row-pad: calc((var(--cell) - 3px - 1.5rem) / 2);
    min-height: calc(var(--cell) - 2px);
    border-bottom: none;
  }
  .table :global(.row:hover) {
    --row-bg: var(--grey-50); /* a shade darker than the rows' paper */
    background-color: var(--row-bg);
  }
  .table :global(.row.selected) {
    --row-bg: var(--navy-100);
    background-color: var(--row-bg);
  }
  /* something to look at (like the orange in the menu): an unread question, a colour without its value */
  .table :global(.row.warn) {
    --row-bg: var(--orange-100);
    background-color: var(--row-bg);
  }
  .table :global(.row.warn:hover) {
    --row-bg: var(--orange-200);
  }
  .table :global(.row.clickable) {
    cursor: pointer;
  }
  /* reached with Tab: a row opens with Enter */
  .table :global(.row:focus-visible) {
    outline: solid 2px var(--navy-700);
    outline-offset: -2px;
  }
  .empty {
    margin: 0;
    padding: var(--cell-pad); /* as far from the side as from the head, as a cell's */
    color: var(--grey-500);
  }
</style>
