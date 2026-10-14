<script>
  import Icon from '$c/Icon.svelte';

  import { editing, selected } from '#/layout/store';
  import { newBanner } from '#/layout/utils';
  import { COLUMNS, rowCount, freeCells } from '#/layout/editor/grid';
  import Tile from '#/layout/elements/tiles/Tile.svelte';

  export let element;

  // in the editor a spare row under the banners, and every free cell a button adding one there
  $: rows = rowCount(element.tiles) + ($editing ? 1 : 0);
  $: free = $editing ? freeCells(element.tiles, rows) : [];

  // a banner resized on the page (its handles, see Tile); moved, others with it ([{ tile, place }], see jumped)
  function move(moves) {
    for (const { tile, place } of moves) Object.assign(tile, place);
    element.tiles = element.tiles;
  }

  function add({ row, column }) {
    const tile = newBanner({ row, column });
    element.tiles = [...element.tiles, tile];
    $selected = { element: element._id, tile: tile._id };
  }
</script>

<div class="tiles" class:editing={$editing} style:--tile-rows={rows} style:--tile-cols={COLUMNS}>
  <!-- in their grid's order: below 56.25rem they follow one another in it -->
  {#each [...element.tiles].sort((a, b) => a.row - b.row || a.column - b.column) as tile (tile._id)}
    <Tile
      {tile}
      block={element._id}
      tiles={element.tiles}
      on:place={(e) => move([{ tile, place: e.detail }])}
      on:move={(e) => move(e.detail)} />
  {/each}
  {#each free as cell (`${cell.row},${cell.column}`)}
    <button
      class="add"
      style="grid-row: {cell.row}; grid-column: {cell.column};"
      on:click|stopPropagation={() => add(cell)}>
      <Icon name="add" width="1.25rem" color="currentColor" />
      Baner
    </button>
  {/each}
</div>

<style>
  .tiles {
    display: grid;
    grid-template-columns: repeat(var(--tile-cols), 1fr);
    grid-template-rows: repeat(var(--tile-rows), 1fr);
    aspect-ratio: var(--tile-cols) / var(--tile-rows);
    width: 100%;
    /* apart and squircled (see Tile), their outer edges on the column's like the product cards' under them */
    gap: clamp(0.75rem, 0.35rem + 1.1vw, 1.25rem);
  }

  /* a free cell in the editor: a dashed slot in the admin's navy, adding a banner there */
  .add {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    border: 2px dashed rgb(27 47 78 / 0.35);
    border-radius: clamp(1.5rem, 0.74rem + 3.24vw, 4rem); /* (a banner's) */
    corner-shape: squircle;
    background-color: rgb(27 47 78 / 0.03);
    color: var(--navy);
    font-size: var(--fs-sm);
    font-weight: 600;
    transition:
      background-color var(--dur-fast) var(--ease-hover),
      border-color var(--dur-fast) var(--ease-hover);
  }
  .add:hover {
    border-color: var(--navy);
    background-color: rgb(27 47 78 / 0.08);
  }

  /* Below 56.25rem the banners linearise (the editor keeps the authored grid); !important beats Tile's inline grid
     placement. */
  @media (max-width: 56.1875rem) {
    .tiles:not(.editing) {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: none;
      aspect-ratio: auto;
    }
    /* Their proportions a minimum height on the banner (from its cell's width), not the cell's aspect ratio: the
       cells stretch, so two in a row are as tall as the taller, whichever card needs more, and a card taller than
       the proportions grows its banner. */
    .tiles:not(.editing) > :global(*) {
      container-type: inline-size;
      grid-column: auto !important;
      grid-row: auto !important;
    }
    .tiles:not(.editing) > :global(* > .tile) {
      min-height: max(100%, 75cqw);
    }
    /* Hidden banners leave no holes. */
    .tiles:not(.editing) > :global(.off) {
      display: none;
    }
    /* Wide banners (3-4 columns) keep the full width, and their own proportions (a row of 4 is 4:1): growing only as
       their card needs, not left tall round it. */
    .tiles:not(.editing) > :global(.wide) {
      grid-column: 1 / -1 !important;
    }
    .tiles:not(.editing) > :global(.wide > .tile) {
      min-height: max(100%, 100cqw / var(--span));
    }
  }

  /* One a row: as tall as their content - the card with the picture beside it (smaller, not the card adrift in a tall
     banner), or under it on a phone. */
  @media (max-width: 34.9375rem) {
    .tiles:not(.editing) {
      grid-template-columns: 1fr;
    }
    .tiles:not(.editing) > :global(* > .tile),
    .tiles:not(.editing) > :global(.wide > .tile) {
      min-height: 100%;
    }
  }
</style>
