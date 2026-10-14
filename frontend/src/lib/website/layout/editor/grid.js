// The banners' grid: 4 columns, as many rows as they take. A banner's place is { row, column, width, height }, from 1.
export const COLUMNS = 4;

const cells = ({ row, column, width, height }) => {
  const list = [];
  for (let r = row; r < row + height; r++) for (let c = column; c < column + width; c++) list.push(`${r},${c}`);
  return list;
};

export const rowCount = (tiles) => (tiles.length ? Math.max(...tiles.map((t) => t.row + t.height - 1)) : 0);

/** Whether `place` is free for `tile`: inside the grid's sides, on no other banner. */
function fits(tiles, tile, place) {
  if (place.row < 1 || place.column < 1 || place.column + place.width - 1 > COLUMNS) return false;
  const taken = new Set(tiles.filter((t) => t !== tile).flatMap(cells));
  return cells(place).every((c) => !taken.has(c));
}

const MAX_HEIGHT = 3;

/**
 * `tile` grown a cell out of one of its sides (left, right, top or bottom); null when there's no room, or it's as big
 * as a banner goes (4 columns, 3 rows). Down past the last row makes a new one.
 */
export function grown(tiles, tile, side) {
  const { row, column, width, height } = tile;
  const place = {
    left: { row, column: column - 1, width: width + 1, height },
    right: { row, column, width: width + 1, height },
    top: { row: row - 1, column, width, height: height + 1 },
    bottom: { row, column, width, height: height + 1 },
  }[side];
  return place.height <= MAX_HEIGHT && fits(tiles, tile, place) ? place : null;
}

/** `tile` a cell smaller from one of its sides, the opposite one staying; null when it's a cell across already. */
export function shrunk(tile, side) {
  const { row, column, width, height } = tile;
  const place = {
    left: { row, column: column + 1, width: width - 1, height },
    right: { row, column, width: width - 1, height },
    top: { row: row + 1, column, width, height: height - 1 },
    bottom: { row, column, width, height: height - 1 },
  }[side];
  return place.width >= 1 && place.height >= 1 ? place : null;
}

// whether every row up to the last one taken has a banner in it (an empty one is a gap on the page)
const gapless = (tiles) => {
  const taken = new Set(tiles.flatMap((t) => Array.from({ length: t.height }, (_, i) => t.row + i)));
  for (let row = 1; row <= rowCount(tiles); row++) if (!taken.has(row)) return false;
  return true;
};

/**
 * `tile` moved towards one of its sides, by the fewest cells it takes: into free cells (a step, or over the banners in
 * the way, jumping them: one too big to swap with, say, across the whole grid), or past the banners beside it - a
 * strip of them none sticks out of - which take its place (they move back by its size): a swap. The banners that
 * move, each with its new place, and whether it passes others ({ moves: [{ tile, place }], over }); null where none
 * of it can be done: at the grid's sides or top, or down past the spare row; or where moving would leave a row empty.
 */
export function jumped(tiles, tile, side) {
  const { row, column, width, height } = tile;
  const across = side === 'left' || side === 'right';
  const forward = side === 'right' || side === 'bottom';
  const others = tiles.filter((t) => t !== tile);
  const last = rowCount(others) + 1; // (the spare row: no further down)
  const done = (moves, over) => {
    const after = tiles.map((t) => moves.find((m) => m.tile === t)?.place ?? t);
    return gapless(after) ? { moves, over } : null;
  };
  for (let by = 1; ; by++) {
    const strip = across
      ? { row, height, column: forward ? column + width : column - by, width: by }
      : { column, width, row: forward ? row + height : row - by, height: by };
    const to = across ? { column: column + (forward ? by : -by) } : { row: row + (forward ? by : -by) };
    if (strip.column < 1 || strip.column + strip.width - 1 > COLUMNS || strip.row < 1) return null;
    if (to.row > last) return null;
    const overlaps = (t) =>
      t.row < strip.row + strip.height &&
      strip.row < t.row + t.height &&
      t.column < strip.column + strip.width &&
      strip.column < t.column + t.width;
    const passed = others.filter(overlaps);
    // free there: it goes, over whatever's on the way
    const place = { row, column, width, height, ...to };
    if (fits(tiles, tile, place)) return done([{ tile, place }], passed.length > 0);
    const inside = (t) =>
      t.row >= strip.row &&
      t.row + t.height <= strip.row + strip.height &&
      t.column >= strip.column &&
      t.column + t.width <= strip.column + strip.width;
    if (!passed.every(inside)) continue;
    // (they move back by its size, to where it was)
    const back = forward ? -1 : 1;
    return done(
      [
        { tile, place },
        ...passed.map((t) => ({
          tile: t,
          place: {
            row: t.row + (across ? 0 : back * height),
            column: t.column + (across ? back * width : 0),
            width: t.width,
            height: t.height,
          },
        })),
      ],
      true,
    );
  }
}

/** The free cells of the first `rows` rows, row by row. */
export function freeCells(tiles, rows) {
  const taken = new Set(tiles.flatMap(cells));
  const free = [];
  for (let row = 1; row <= rows; row++)
    for (let column = 1; column <= COLUMNS; column++) if (!taken.has(`${row},${column}`)) free.push({ row, column });
  return free;
}

/** The first free cell, row by row; all taken, the first of a new row. */
export const firstFree = (tiles) => freeCells(tiles, rowCount(tiles) + 1)[0];
