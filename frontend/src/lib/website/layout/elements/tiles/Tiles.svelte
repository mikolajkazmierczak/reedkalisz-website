<script>
  import { editing } from '#/layout/store';
  import { create } from '#/layout/utils';
  import Tile from '#/layout/elements/tiles/Tile.svelte';

  export let element;

  const columnCount = 4; // arbitrary
  $: tiles = element.tiles;
  $: rowCount = tiles.length ? Math.max(...tiles.map(t => t.row - 1 + t.height)) : $editing ? 1 : 0;
  $: matrix = getOccupancyMatrix(tiles, columnCount, rowCount); // track which cells are occupied (0 or tile)
  $: matrixTiles = parseMatrix(matrix);

  function getOccupancyMatrix(tiles, columnCount, rowCount) {
    if (rowCount === 0) return [];

    const matrix = Array.from(Array(rowCount).fill(), () => Array(columnCount).fill(null));
    for (const tile of tiles) {
      const { row, column, width, height } = tile;
      for (let i = row - 1; i < row - 1 + height; i++) {
        for (let j = column - 1; j < column - 1 + width; j++) {
          matrix[i][j] = tile;
        }
      }
    }
    return matrix;
  }

  function parseMatrix(matrix) {
    // returns a flat array of unique tiles (including empty spaces)
    const tiles = [];
    for (const [i, row] of matrix.entries()) {
      for (const [j, cell] of row.entries()) {
        if (cell) {
          const sameSize = (t, c) => t.width === c.width && t.height === c.height;
          const samePosition = (t, c) => t.row === c.row && t.column === c.column;
          const isDuplicate = tiles.some(tile => sameSize(tile, cell) && samePosition(tile, cell));
          if (!isDuplicate) tiles.push(cell);
        } else {
          tiles.push(create.tile({ _empty: true, row: i + 1, column: j + 1, width: 1, height: 1 }));
        }
      }
    }
    return tiles;
  }

  function handleDelete(id) {
    element.tiles = element.tiles.filter(t => t._id !== id);
  }

  function handleAdd(id) {
    const tile = matrixTiles.find(t => t._id === id);
    element.tiles = [...element.tiles, { ...tile, _empty: false }];
  }
</script>

<div
  class="tiles"
  style:grid-template-rows="repeat({rowCount}, 1fr)"
  style:aspect-ratio={`${columnCount} / ${rowCount}`}
>
  {#each matrixTiles as tile}
    {@const { _id: id } = tile}
    <Tile {matrix} bind:element bind:tile on:delete={() => handleDelete(id)} on:add={() => handleAdd(id)} />
  {/each}
</div>

<style>
  .tiles {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 1rem;
    width: 100%;
  }
</style>
