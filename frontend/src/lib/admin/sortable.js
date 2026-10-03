import Sortable from 'sortablejs';

// A row (or grid) of things put in order by dragging, each by its handle:
//   <div use:sortable={{ sort: (from, to) => (items = moveTo(items, from, to)) }}>
//     {#each items as item (item)}<div data-sortable><button data-handle>...</button>...</div>{/each}
//     <button>Dodaj</button>   <- (not `data-sortable`: stays where it is)
//   </div>
// `sort(from, to)` gets the places among the draggable ones, and the list is put in that order (or it returns false).
// The dragged one stays where it was dropped: the list's update then has nothing left to move (putting it back for the
// list to move it left the page and the list apart in the product editor - a photo showed where another one was).
// Ones with a `data-group` (a variant's images among a product's) go only among the others of their group. Escape, or
// a drop away from them, puts it back. A disabled handle (one alone) drags nothing.
export function sortable(node, options) {
  let { sort } = options;
  // a drag let go of by Escape: it goes back where it was (see onEnd)
  let cancelled = false;
  const escape = (e) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation(); // not closing the modal it's in
    cancelled = true;
    // let go of it (Sortable has no cancel): its end puts it back, see onEnd - by the event Sortable waits for (desktop
    // Safari: mouseup, it uses no pointer events there)
    const up = instance.options.supportPointer ? 'pointerup' : 'mouseup';
    document.dispatchEvent(new MouseEvent(up));
  };
  const back = ({ item, from, oldIndex, newIndex }) =>
    from.insertBefore(item, from.children[oldIndex < newIndex ? oldIndex : oldIndex + 1] ?? null);
  // dropped over the room the dragged one and the others of its group take (with a margin around it)
  function dropped({ item, from, originalEvent }) {
    const { clientX: x, clientY: y } = originalEvent?.changedTouches?.[0] ?? originalEvent ?? {};
    if (x == null) return true;
    const group = item.dataset.group;
    const tiles = [...from.querySelectorAll(':scope > [data-sortable]')].filter((t) => t.dataset.group === group);
    const rects = tiles.map((t) => t.getBoundingClientRect());
    const pad = 24;
    return (
      x >= Math.min(...rects.map((r) => r.left)) - pad &&
      x <= Math.max(...rects.map((r) => r.right)) + pad &&
      y >= Math.min(...rects.map((r) => r.top)) - pad &&
      y <= Math.max(...rects.map((r) => r.bottom)) + pad
    );
  }
  const instance = Sortable.create(node, {
    handle: '[data-handle]:not([disabled])',
    draggable: '[data-sortable]',
    animation: 150,
    // its own dragging, not the browser's: the same with a mouse and a finger, and the tiles repaint as they move
    // (the browser's left a moved tile showing the picture of the one there before)
    forceFallback: true,
    fallbackOnBody: true, // the copy under the pointer isn't cut off by a scrolling box (a modal)
    fallbackClass: 'sortable-fallback',
    ghostClass: 'sortable-ghost',
    onMove: ({ dragged, related }) => dragged.dataset.group === related.dataset.group,
    onStart() {
      cancelled = false;
      window.addEventListener('keydown', escape, true);
    },
    onEnd(e) {
      window.removeEventListener('keydown', escape, true);
      if (e.oldIndex === e.newIndex) return;
      if (cancelled || !dropped(e)) return back(e);
      // a list that doesn't take the move (sort -> false) gets its page back as it was
      if (sort(e.oldDraggableIndex, e.newDraggableIndex) === false) back(e);
    },
  });
  return {
    update(next) {
      sort = next.sort;
    },
    destroy() {
      window.removeEventListener('keydown', escape, true);
      instance.destroy();
    },
  };
}

// the list with the item from `from` at `to`, every `index` its place (the same items: a list keyed by them only moves
// them, not drawing them again)
export function moveTo(items, from, to) {
  const list = [...items];
  list.splice(to, 0, ...list.splice(from, 1));
  list.forEach((item, index) => (item.index = index));
  return list;
}
