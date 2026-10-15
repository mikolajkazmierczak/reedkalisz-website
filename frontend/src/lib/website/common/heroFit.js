// The hero's machine is there to look good: beside the text (from 47.5rem) it's as tall as the column of text and
// buttons on its left - from the title's top to the buttons' foot - standing on the buttons' line at the column's
// right, unless at that size the drawing itself (not its box: its top left is mostly sky) would run into the text:
// then it's scaled down just so far that it doesn't - clear of each title line beside it, and of the lede's lines and
// the buttons by the columns' gap. "Porządnie," gets a line of its own (`data-break`) where that lets it be bigger.
// Measured (where the title's lines end is only known once they're set): first by a script in the page as it's sent,
// right after the hero (`heroScript`), so it's shown at its size, not grown into it once the page wakes up; then on
// every resize and once the fonts are in. It sets the machine's width (`--machine-w`).

/**
 * The fit, for the hero's grid (its title, its body - lede and buttons -, its plate - the machine): self-contained, no
 * names from outside it, as it's also written into the page as is (see `heroScript`).
 * @param {HTMLElement} inner
 */
export function fitter(inner) {
  // between the title's words and the drawing
  const GAP = 12;
  // the drawing's outline, read in bands this tall (its units)
  const BAND = 2;

  // a text's lines, each as far right and down as its words go
  function lines(text) {
    const range = document.createRange();
    range.selectNodeContents(text);
    const found = [];
    for (const rect of range.getClientRects()) {
      const line = found.find((l) => Math.abs(l.top - rect.top) < rect.height / 2);
      if (line) {
        line.right = Math.max(line.right, rect.right);
        line.bottom = Math.max(line.bottom, rect.bottom);
      } else found.push({ top: rect.top, right: rect.right, bottom: rect.bottom });
    }
    return found;
  }

  // where a clipped group shows, on the screen (its clip's rectangle, in the group's own units)
  function clipped(group) {
    const rect = group.ownerSVGElement.querySelector(`${group.getAttribute('clip-path').slice(4, -1)} rect`);
    const at = group.getScreenCTM();
    const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((k) => rect[k].baseVal.value);
    const corners = [
      [x, y],
      [x + w, y + h],
    ].map(([cx, cy]) => new DOMPoint(cx, cy).matrixTransform(at));
    return {
      left: Math.min(...corners.map((p) => p.x)),
      right: Math.max(...corners.map((p) => p.x)),
      top: Math.min(...corners.map((p) => p.y)),
      bottom: Math.max(...corners.map((p) => p.y)),
    };
  }

  // The drawing's outline from the left, in its own units: for each band of its height, the leftmost point anything
  // in it is drawn at - as far as its clip lets it show (the belt's ticks run on past it, unseen). Read once off the
  // drawing, whatever its size; faint or faded parts count too, as they're seen at some point of their turn.
  function outline(svg) {
    const box = svg.getBoundingClientRect();
    // (not laid out yet)
    if (!box.width) return null;
    // (read as it's drawn, at its animations' start, then back: else its moving parts are wherever the page woke up)
    const animations = svg.getAnimations({ subtree: true });
    const times = animations.map((a) => a.currentTime);
    for (const a of animations) a.currentTime = 0;
    const view = svg.viewBox.baseVal;
    const scale = box.width / view.width;
    const bands = new Array(Math.ceil(view.height / BAND)).fill(Infinity);
    const clips = new Map();
    for (const part of svg.querySelectorAll('path, rect, circle, ellipse, line, polyline, polygon, text, image, use')) {
      if (part.closest('defs, clipPath, pattern, mask')) continue;
      let { left, right, top, bottom } = part.getBoundingClientRect();
      for (let group = part.closest('[clip-path]'); group; group = group.parentElement.closest('[clip-path]')) {
        if (!clips.has(group)) clips.set(group, clipped(group));
        const clip = clips.get(group);
        [left, right] = [Math.max(left, clip.left), Math.min(right, clip.right)];
        [top, bottom] = [Math.max(top, clip.top), Math.min(bottom, clip.bottom)];
      }
      if (right < left || bottom < top || (right === left && bottom === top)) continue;
      const from = Math.max(0, Math.floor((top - box.top) / scale / BAND));
      const to = Math.min(bands.length, Math.ceil((bottom - box.top) / scale / BAND));
      for (let i = from; i < to; i++) bands[i] = Math.min(bands[i], (left - box.left) / scale);
    }
    animations.forEach((a, i) => times[i] !== null && (a.currentTime = times[i]));
    return { bands, width: view.width, height: view.height };
  }

  const wide = matchMedia('(min-width: 47.5rem)');
  const title = inner.querySelector('.hero__title');
  const lede = inner.querySelector('.hero__lede');
  const acts = inner.querySelector('.hero__acts');
  const plate = inner.querySelector('.hero__plate');
  let shape = null;

  // the tallest it can be, at the right on the buttons' line, its drawing touching none of the text
  function tallest() {
    const right = plate.getBoundingClientRect().right;
    const bottom = acts.getBoundingClientRect().bottom;
    const gap = parseFloat(getComputedStyle(inner).columnGap) || 0;
    const keep = [
      ...lines(title).map((l) => ({ ...l, gap: GAP })),
      ...lines(lede).map((l) => ({ ...l, gap })),
      ...[...acts.children].map((b) => ({ ...b.getBoundingClientRect().toJSON(), gap })),
    ];
    const { bands, width, height } = shape;
    // at this height, does the drawing stay right of each line (within the bands it reaches there)?
    const fits = (tall) => {
      const scale = tall / height;
      const left = right - width * scale;
      return keep.every((line) => {
        const from = Math.max(0, Math.floor((height - (bottom - line.top) / scale) / BAND));
        const to = Math.min(bands.length, Math.ceil((height - (bottom - line.bottom) / scale) / BAND));
        let x = Infinity;
        for (let i = from; i < to; i++) x = Math.min(x, bands[i]);
        return x === Infinity || line.right + line.gap <= left + x * scale;
      });
    };
    let low = 0;
    let high = bottom - title.getBoundingClientRect().top;
    if (fits(high)) return high;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (fits(mid)) low = mid;
      else high = mid;
    }
    return low;
  }

  return function fit() {
    if (!wide.matches) {
      inner.style.removeProperty('--machine-w');
      title.removeAttribute('data-break');
      return;
    }
    shape ??= outline(plate.querySelector('svg'));
    if (!shape) return;
    let best = null;
    for (const brk of ['0', '1']) {
      title.dataset.break = brk;
      const tall = tallest();
      if (!best || tall > best.tall + 1) best = { brk, tall };
    }
    title.dataset.break = best.brk;
    inner.style.setProperty('--machine-w', `${Math.floor((best.tall * shape.width) / shape.height)}px`);
  };
}

// The fit as a script for the page as it's sent, right after the hero's grid: run as it's read, before the page is
// first shown (the server's code isn't minified: its comment lines and indents left out)
export const heroScript = `<script>(${String(fitter)
  .replace(/^\s*\/\/.*\n/gm, '')
  .replace(/^\s+/gm, '')})(document.currentScript.previousElementSibling)()</script>`;

/** @param {HTMLElement} inner the hero's grid */
export function heroFit(inner) {
  const fit = fitter(inner);
  const wide = matchMedia('(min-width: 47.5rem)');

  // (fitted once a frame at most)
  let frame = null;
  const schedule = () => frame ?? (frame = requestAnimationFrame(() => ((frame = null), fit())));
  const resized = new ResizeObserver(schedule);
  resized.observe(inner);
  wide.addEventListener('change', schedule);
  document.fonts?.ready.then(schedule);
  fit();
  return {
    destroy() {
      resized.disconnect();
      wide.removeEventListener('change', schedule);
      if (frame) cancelAnimationFrame(frame);
    },
  };
}
