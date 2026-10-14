// Poland as a grid of dots, like the hero's blueprint grid: its outline (traced by hand, [longitude, latitude],
// clockwise from the German border on Usedom), the grid's dots inside it, and where a place falls on it.

const OUTLINE = [
  // the coast, west to east (the Szczecin and Vistula lagoons are water: around them, their spits added below)
  [14.22, 53.93],
  [14.45, 53.95],
  [14.77, 54.03],
  [15.08, 54.08],
  [15.3, 54.15],
  [15.57, 54.18],
  [16.0, 54.27],
  [16.41, 54.43],
  [16.85, 54.59],
  [17.25, 54.72],
  [17.55, 54.76],
  [18.0, 54.82],
  [18.33, 54.84],
  [18.43, 54.79],
  [18.5, 54.62],
  [18.55, 54.5],
  [18.66, 54.4],
  [18.95, 54.35],
  [19.25, 54.28],
  [19.5, 54.3],
  [19.8, 54.42],
  // Russia (Kaliningrad), Lithuania
  [20.5, 54.38],
  [21.5, 54.33],
  [22.3, 54.35],
  [22.79, 54.36],
  [23.05, 54.3],
  [23.5, 54.17],
  [23.52, 53.95],
  // Belarus
  [23.6, 53.75],
  [23.65, 53.5],
  [23.9, 53.2],
  [23.92, 52.95],
  [23.94, 52.73],
  [23.6, 52.6],
  [23.35, 52.52],
  [23.2, 52.37],
  [23.45, 52.2],
  [23.65, 52.07],
  // Ukraine
  [23.63, 51.95],
  [23.6, 51.6],
  [23.68, 51.3],
  [23.95, 51.1],
  [24.12, 50.87],
  [24.0, 50.5],
  [23.7, 50.38],
  [23.45, 50.2],
  [23.0, 49.85],
  [22.72, 49.6],
  [22.68, 49.45],
  [22.78, 49.2],
  [22.89, 49.0],
  // Slovakia
  [22.56, 49.08],
  [22.0, 49.2],
  [21.6, 49.42],
  [21.1, 49.4],
  [20.9, 49.33],
  [20.6, 49.4],
  [20.35, 49.38],
  [20.1, 49.2],
  [19.8, 49.2],
  [19.75, 49.4],
  [19.5, 49.58],
  [19.2, 49.42],
  [18.85, 49.52],
  // Czechia
  [18.63, 49.75],
  [18.3, 49.92],
  [18.1, 50.02],
  [17.75, 50.15],
  [17.55, 50.25],
  [17.38, 50.3],
  [17.0, 50.43],
  [16.88, 50.25],
  [16.66, 50.1],
  [16.4, 50.33],
  [16.22, 50.44],
  [16.45, 50.52],
  [16.2, 50.65],
  [15.98, 50.7],
  [15.72, 50.74],
  [15.42, 50.82],
  [15.3, 50.88],
  [15.0, 51.02],
  [14.97, 50.87],
  [14.82, 50.87],
  // Germany, up the Neisse and the Oder
  [14.98, 51.12],
  [15.04, 51.25],
  [14.97, 51.45],
  [14.72, 51.55],
  [14.72, 51.75],
  [14.65, 51.85],
  [14.72, 51.95],
  [14.65, 52.1],
  [14.55, 52.35],
  [14.62, 52.6],
  [14.45, 52.75],
  [14.15, 52.85],
  [14.35, 53.05],
  [14.42, 53.25],
  [14.4, 53.42],
  [14.3, 53.55],
  [14.27, 53.73],
  // round the Szczecin Lagoon, back to Usedom
  [14.6, 53.68],
  [14.62, 53.84],
  [14.42, 53.86],
];

// too thin for the outline to catch a dot: the Hel peninsula and the Vistula Spit, a dot wherever they cross a column
const SPITS = [
  [
    [18.43, 54.79],
    [18.6, 54.71],
    [18.8, 54.61],
  ],
  [
    [18.95, 54.36],
    [19.3, 54.41],
    [19.63, 54.45],
  ],
];

const STEP = 0.15; // a row, in degrees of latitude (about 17 km); a column is as long on the ground
const SQUASH = Math.cos((52 * Math.PI) / 180); // a degree of longitude this far north
const WEST = 14.1;
const NORTH = 54.9;

/** A place on the grid: [column, row], fractional. */
const project = (lon, lat) => [((lon - WEST) * SQUASH) / STEP, (NORTH - lat) / STEP];

/** A place's dot, as "column,row": the nearest one (by the coast or a border, the nearest inside). */
export function cell(lon, lat) {
  const [x, y] = project(lon, lat);
  const [cx, cy] = [Math.round(x), Math.round(y)];
  if (DOTS.has(`${cx},${cy}`)) return `${cx},${cy}`;
  let best = null;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const key = `${cx + dx},${cy + dy}`;
      const d = (cx + dx - x) ** 2 + (cy + dy - y) ** 2;
      if (DOTS.has(key) && (!best || d < best.d)) best = { key, d };
    }
  }
  return best?.key ?? `${cx},${cy}`;
}

function inside([x, y], ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function grid() {
  const ring = OUTLINE.map(([lon, lat]) => project(lon, lat));
  const xs = ring.map(([x]) => x);
  const ys = ring.map(([, y]) => y);
  const dots = new Set();
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      if (inside([x, y], ring)) dots.add(`${x},${y}`);
    }
  }
  for (const spit of SPITS) {
    const line = spit.map(([lon, lat]) => project(lon, lat));
    for (let k = 0; k < line.length - 1; k++) {
      const [[x0, y0], [x1, y1]] = [line[k], line[k + 1]];
      for (let x = Math.ceil(Math.min(x0, x1)); x <= Math.floor(Math.max(x0, x1)); x++) {
        dots.add(`${x},${Math.round(y0 + ((y1 - y0) * (x - x0)) / (x1 - x0))}`);
      }
    }
  }
  return dots;
}

/** Every dot, as "column,row" (whole numbers). */
export const DOTS = grid();

/** The grid's extent: [left, top, width, height]. */
export const BOX = (() => {
  const all = [...DOTS].map((d) => d.split(',').map(Number));
  const xs = all.map(([x]) => x);
  const ys = all.map(([, y]) => y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
})();
