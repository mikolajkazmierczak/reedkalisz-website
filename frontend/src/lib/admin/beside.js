// "+ Dodaj" at the end of a grid of boxes (a product's photos, files, variants): `ui-add--side` (turned on its side,
// see ui-admin.css) while it's on a row with a box before it, as a wide button when it's on a row of its own. Worked out
// from the page, again as the grid changes width or what's in it (its place in the grid doesn't depend on its size).
export function beside(node) {
  const grid = node.parentElement;
  const check = () => {
    const before = node.previousElementSibling;
    node.classList.toggle('ui-add--side', !!before && Math.abs(before.offsetTop - node.offsetTop) < 2);
  };
  const resized = new ResizeObserver(check);
  resized.observe(grid);
  const changed = new MutationObserver(check);
  changed.observe(grid, { childList: true });
  check();
  return {
    destroy() {
      resized.disconnect();
      changed.disconnect();
    },
  };
}
