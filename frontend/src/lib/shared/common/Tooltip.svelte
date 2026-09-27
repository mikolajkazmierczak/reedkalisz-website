<script context="module">
  import { browser } from '$app/environment';

  // One listener for every tooltip: where the pointer is, for a tooltip that's about to show.
  const pointer = { x: 0, y: 0 };
  if (browser) {
    window.addEventListener(
      'pointermove',
      (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      },
      { passive: true },
    );
  }
</script>

<script>
  import { onMount } from 'svelte';

  export let border = 'var(--border)';
  export let backgroundColor = 'var(--light)';

  let anchor;
  let visible = false;

  onMount(() => {
    // a child of any element, it shows while that element is hovered; the anchor only finds it
    const parent = anchor.parentNode;
    anchor.remove();
    // made while the pointer is already on it (as a card's swatches are, on the card's first hover)
    visible = parent.matches(':hover');
    // placed where it's entered: a tap has no pointermove before it
    const enter = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      visible = true;
    };
    const leave = () => (visible = false);
    parent.addEventListener('pointerenter', enter);
    parent.addEventListener('pointerleave', leave);
    return () => {
      parent.removeEventListener('pointerenter', enter);
      parent.removeEventListener('pointerleave', leave);
    };
  });

  // Made only while shown, at the end of the page: inside a table cell (its own layer), a blurred bar or a sliding
  // editor it would be held under the neighbouring content, or placed and clipped by them.
  // It appears where the pointer is: to its right, or to its left near the window's right edge, never below the window.
  const GAP = 25; // from the pointer
  const EDGE = 8; // from the window's edges
  const LAG = 40; // ms: close behind the pointer, eased by the time passed, so a slow frame never overshoots
  let tooltip;
  let x = 0;
  let y = 0;
  let target;
  let frame = null;
  let last;
  function place(px, py) {
    const { offsetWidth: w, offsetHeight: h } = tooltip;
    return {
      x: px + GAP + w > innerWidth - EDGE ? Math.max(EDGE, px - GAP - w) : px + GAP,
      y: Math.max(EDGE, Math.min(py, innerHeight - EDGE - h)),
    };
  }
  function step(now) {
    const k = 1 - Math.exp(-Math.max(0, now - last) / LAG); // a frame can start before the move that asked for it
    last = now;
    x += (target.x - x) * k;
    y += (target.y - y) * k;
    if (Math.abs(target.x - x) + Math.abs(target.y - y) < 0.5) ({ x, y } = target);
    frame = x === target.x && y === target.y ? null : requestAnimationFrame(step);
  }
  function aim(e) {
    target = place(e.clientX, e.clientY);
    if (frame) return;
    last = performance.now();
    frame = requestAnimationFrame(step);
  }
  function float(node) {
    document.body.appendChild(node);
    tooltip = node;
    ({ x, y } = target = place(pointer.x, pointer.y));
    window.addEventListener('pointermove', aim, { passive: true });
    return {
      destroy() {
        window.removeEventListener('pointermove', aim);
        cancelAnimationFrame(frame);
        frame = null;
        node.remove();
      },
    };
  }
  const appear = () => ({
    duration: 200,
    css: (t) => `opacity: ${t}; transform: translateY(${(t - 1) * 0.625}rem)`,
  });
</script>

<span bind:this={anchor} hidden />
{#if visible}
  <div
    use:float
    transition:appear
    style:border
    style:background-color={backgroundColor}
    style:top="{y}px"
    style:left="{x}px">
    <slot />
  </div>
{/if}

<style>
  div {
    pointer-events: none;
    z-index: 2000; /* above everything: popups and the login (1000), errors (1003) */
    position: fixed;
    top: 0;
    left: 0;
    width: max-content; /* not squeezed near the right edge (it moves left instead) */
    max-width: calc(100vw - 1rem);
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
  }
</style>
