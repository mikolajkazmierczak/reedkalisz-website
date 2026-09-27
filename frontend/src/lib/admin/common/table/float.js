// A floating cell: its content, when cut, shows whole on hover, spilling over the next cells - or, when it would run
// out of the table, over the previous ones (`flipped`). Only a cut content floats (`floating`); a cut one is marked
// `cut` all the time (for the fade of what can't end in "..."). The cell's first child is the content.
// `enabled: false`: just cut, no floating.
export function float(node, { enabled = true } = {}) {
  let on = enabled;
  const content = () => node.firstElementChild;
  const isCut = () => (content()?.scrollWidth ?? 0) > node.clientWidth + 1;

  const measure = () => node.classList.toggle('cut', isCut());
  const observer = new ResizeObserver(measure);
  observer.observe(node);
  // a row kept across a refetch gets new content in boxes of the same size: no resize, so watch the content too
  const mutations = new MutationObserver(measure);
  if (content()) {
    observer.observe(content());
    mutations.observe(content(), { childList: true, subtree: true, characterData: true });
  }

  function enter() {
    const inner = content();
    if (!on || !inner || !isCut()) return;
    node.classList.add('floating');
    const table = node.closest('.table');
    if (table && inner.getBoundingClientRect().right > table.getBoundingClientRect().right) {
      node.classList.add('flipped');
      inner.style.left = 'auto';
      inner.style.right = '0';
    }
  }
  function leave() {
    node.classList.remove('floating', 'flipped');
    const inner = content();
    if (!inner) return;
    inner.style.left = '0';
    inner.style.right = 'auto';
  }
  node.addEventListener('mouseenter', enter);
  node.addEventListener('mouseleave', leave);
  return {
    update({ enabled = true } = {}) {
      on = enabled;
    },
    destroy() {
      observer.disconnect();
      mutations.disconnect();
      node.removeEventListener('mouseenter', enter);
      node.removeEventListener('mouseleave', leave);
    },
  };
}
