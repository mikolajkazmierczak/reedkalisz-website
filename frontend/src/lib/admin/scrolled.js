// A top bar over what scrolls under it (the page's header, an editor's): solid while nothing is under it, its ground
// turning to frost and its line coming in with the first `distance` px scrolled - along with the scroll. Sets
// `--scrolled` (0 to 1) on the bar, see .ui-topbar. `source`: the element that scrolls, or none for the page.
export function scrolled(node, source = null) {
  const distance = 24;
  let target = null;
  const set = () => {
    const top = source ? source.scrollTop : window.scrollY;
    node.style.setProperty('--scrolled', Math.min(1, Math.max(0, top / distance)).toFixed(3));
  };
  function listen() {
    target?.removeEventListener('scroll', set);
    target = source ?? window;
    target.addEventListener('scroll', set, { passive: true });
    set();
  }
  listen();
  return {
    update(next) {
      source = next;
      listen();
    },
    destroy: () => target?.removeEventListener('scroll', set),
  };
}
