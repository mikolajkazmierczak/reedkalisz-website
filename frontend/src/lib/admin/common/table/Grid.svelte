<script>
  // The frame of every admin table: a grey head row, compact rows lit grey on hover, no lines between the cells.
  // The head and every row share one grid, `columns` (css grid-template-columns). Rows are the default slot, each a
  // `.row` (`.selected` to mark one, `.clickable` for a row that opens something); `empty` is said when there are none.
  // The API tabs fill it by hand, the lists of the admin through Table (from `head` and `mapper`).
  export let columns;
  export let empty = null;
  export let indentFirst = false; // the first column is text: set in from the edge like the empty text, not a cell's pad
</script>

<div class="table" class:indent-first={indentFirst} style:--columns={columns}>
  <!-- as wide as the table, wider only when the columns' minimums don't fit: the grey head goes on while scrolling -->
  <div class="grid">
    <div class="head" role="presentation" on:dragenter><slot name="head" /></div>
    <slot />
    {#if empty}
      <p class="empty">{empty}</p>
    {/if}
  </div>
</div>

<style>
  .table {
    --row-pad: 0.2rem; /* tight: the lists are long, as much as possible should fit on the screen */
    --cell-pad: 0.5rem;
    --col-gap: calc(2 * var(--row-pad)); /* as far apart side by side as one above the other */
    --row-border: solid 1px var(--black-6);
    overflow-x: auto;
    border-radius: var(--box-radius);
    corner-shape: squircle;
    border: var(--border-light);
    background-color: var(--light);
  }
  .grid {
    width: fit-content;
    min-width: 100%;
  }
  .head,
  .table :global(.row) {
    display: grid;
    grid-template-columns: var(--columns);
    gap: var(--col-gap);
    align-items: center;
    padding: var(--row-pad) var(--cell-pad);
  }
  /* a cell's content may be cut (see Float), never widen the column */
  .table :global(.row > *),
  .head > :global(*) {
    min-width: 0;
  }
  .indent-first .head,
  .indent-first :global(.row) {
    padding-left: 0.75rem;
  }
  .head {
    padding-top: 0.4rem;
    padding-bottom: 0.4rem;
    border-bottom: var(--border-light);
    font-size: 0.85rem;
    color: var(--grey-500);
    background-color: var(--grey-100);
  }
  /* --row-bg: the row's colour, for what fades into it (see Float) */
  .table :global(.row) {
    --row-bg: var(--light);
    border-bottom: var(--row-border);
  }
  .table :global(.row:last-child) {
    border-bottom: none;
  }
  .table :global(.row:hover) {
    --row-bg: var(--grey-50); /* the head's grey at half, over white */
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
    padding: 0.75rem; /* as far from the side as from the head */
    color: var(--grey-500);
  }
</style>
