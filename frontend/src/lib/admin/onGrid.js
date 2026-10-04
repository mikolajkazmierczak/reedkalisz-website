// What lies on the cutting mat (see Mat) kept on its cells, though it's as big as its content - so it can't be set in
// CSS, it's measured as it's laid out (and again whenever what's in the node changes: a page, its size, a box's):
// - what lies on the mat - a box, a bar, a table (.ui-on-mat, not one on a list page or in a box), anything marked
//   .ui-snap - is whole half cells tall: its slot, it sitting 1px inside it (see .ui-on-mat), so with the half cell
//   between them what follows stays on the cells too;
// - section heads' labels (.ui-h2) are whole half cells wide, and each is pushed down onto a line of the mat.
// The boxes and the labels all at once - cleared, measured, then set - two layouts however many there are.

export const CELL = 1.75; // rem (--cell)
const MARGIN = CELL / 2; // rem, the mat's frame from its edge (--mat-margin)
export const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
export const whole = (size, step) => Math.max(1, Math.ceil(size / step - 0.02)) * step; // (a hair over is a rounding)
// (a table on a list page is as tall as the page lets it, see .ui-fill; one in a box is the box's)
const BOXES =
  '.ui-box:not(.ui-box .ui-box), .ui-bar:not(.ui-snap > .ui-bar), .ui-snap, .ui-on-mat:not(.ui-fill .ui-on-mat, .ui-box .ui-on-mat)';

export function onGrid(node) {
  let frame = null;
  // an editor's sheet is laid out inside the page's node, on a mat of its own (see Editor): each node keeps to what's
  // on its own mat and to the changes made there
  node.dataset.onGrid = '';
  const own = (el) => el.closest('[data-on-grid]') === node;
  const observed = new Set(); // the boxes being watched, let go of once their page is gone

  function snap() {
    const mat = node.querySelector(':scope > .mat');
    if (!mat) return;
    const rem = remPx();
    const cell = CELL * rem;
    const half = cell / 2;

    for (const box of observed) {
      if (!box.isConnected) {
        resizes.unobserve(box);
        observed.delete(box);
      }
    }
    const boxes = [...node.querySelectorAll(BOXES)].filter(own);
    const heads = [...node.querySelectorAll('.ui-h2')].filter(own);
    const labels = heads.map((head) => head.querySelector(':scope > span')).filter(Boolean); // (a button may go before)
    for (const box of boxes) {
      if (!observed.has(box)) {
        resizes.observe(box); // (its content wrapping as the window narrows)
        observed.add(box);
      }
      box.style.minHeight = ''; // (as tall as its content, to measure)
    }
    for (const label of labels) label.style.minWidth = '';
    const heights = boxes.map((box) => box.getBoundingClientRect().height);
    const widths = labels.map((label) => label.getBoundingClientRect().width);
    // (the room it has: one that had to give way - a long name, cut - is rounded down, never past its head)
    const rooms = labels.map(
      (label) => label.parentElement.getBoundingClientRect().right - label.getBoundingClientRect().left,
    );
    boxes.forEach((box, i) => {
      const slot = whole(heights[i] + 1, half);
      if (slot - 1 - heights[i] > 0.01) box.style.minHeight = `${slot - 1}px`; // (a fraction short puts all after off)
    });
    labels.forEach((label, i) => {
      const room = Math.floor((rooms[i] + 1 + 0.02) / half) * half;
      label.style.minWidth = `${Math.min(whole(widths[i] + 1, half), room) - 1}px`;
    });

    // the heads onto lines: a head pushed moves the ones under it, so all are measured at once, each one's push worked
    // out with the ones before it - then checked, and where heads lie side by side (they don't move each other) each
    // measured again past the ones before (a layout per head that moved)
    const origin = mat.getBoundingClientRect().top + MARGIN * rem; // the frame's top line
    const onto = (top) => {
      const off = (((top - origin) % cell) + cell) % cell;
      return off < 0.5 || cell - off < 0.5 ? 0 : cell - off; // (a fraction of a pixel is on the line)
    };
    const pushOf = (head) => parseFloat(head.style.getPropertyValue('--push')) || 0;
    const slot = (head, pushed) => head.getBoundingClientRect().top - 1 - pushed; // its slot's top, unpushed
    const astray = (head) => Math.abs(onto(slot(head, pushOf(head))) - pushOf(head)) >= 0.5; // (not on its line)
    const set = (head, push) => Math.abs(push - pushOf(head)) >= 0.5 && head.style.setProperty('--push', `${push}px`);
    const pushed = heads.map(pushOf);
    const tops = heads.map((head, i) => slot(head, pushed[i]));
    let shift = 0;
    const pushes = tops.map((top, i) => {
      const push = onto(top + shift);
      shift += push - pushed[i];
      return push;
    });
    heads.forEach((head, i) => set(head, pushes[i]));
    if (heads.some(astray)) for (const head of heads) set(head, onto(slot(head, pushOf(head))));
  }

  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(snap);
  };
  const resizes = new ResizeObserver(schedule);
  // and what's in it: a list page is as tall as the window whatever's on it, so going to another one changes what's in
  // the node, not its size. What's made on the mat only to be moved to <body> (a tooltip, a thumbnail's preview, a
  // select's list: see portal.js) lies over it, not on it - nor does the blank text Svelte leaves between elements.
  const laidOut = (n) =>
    n.nodeType === Node.ELEMENT_NODE
      ? node.contains(n) || !n.isConnected
      : n.nodeType === Node.TEXT_NODE && !!n.data.trim();
  const changes = new MutationObserver((records) => {
    if (records.some((r) => own(r.target) && [...r.addedNodes, ...r.removedNodes].some(laidOut))) schedule();
  });
  resizes.observe(node);
  changes.observe(node, { childList: true, subtree: true });
  schedule();

  return {
    destroy() {
      cancelAnimationFrame(frame);
      resizes.disconnect();
      changes.disconnect();
    },
  };
}
