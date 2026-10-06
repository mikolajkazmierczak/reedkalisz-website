import { cubicOut } from 'svelte/easing';

// A transition for what comes in at the start of a bar (Anuluj and Zapisz once something changed, Importuj once
// something's picked): it widens from nothing as it fades in, and what's after it moves aside along with it - the
// bar's gap after it too, which a plain slide would add all at once (a jump), comes in with it (a margin taking it back
// until then). The other way round going out.
export function grow(node, { duration = 200 } = {}) {
  const gap = parseFloat(getComputedStyle(node.parentElement).columnGap) || 0;
  return {
    duration,
    easing: cubicOut,
    // the width measured on every run, not once: Svelte keeps one config both ways, and what's inside may have grown
    // meanwhile (Importuj turning into "Importowanie..."); a run's frames are all made at once, before it starts
    css: (t) =>
      `overflow: hidden; flex-shrink: 0; max-width: ${t * node.offsetWidth}px; margin-right: ${-(1 - t) * gap}px; opacity: ${t};`,
  };
}
