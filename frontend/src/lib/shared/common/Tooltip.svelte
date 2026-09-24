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
  import { spring } from 'svelte/motion';

  export let border = 'var(--border)';
  export let backgroundColor = 'var(--light)';

  export let show = null; // show/hide (if null then visibility is controlled by parentHover)

  let tooltip;
  let parentHover = false;

  let mouse = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.5 });

  $: visible = show === null ? parentHover : show;

  // Only a visible tooltip follows the pointer; it appears where the pointer is.
  function handlePointerMove(e) {
    mouse.set({ x: e.clientX + 25, y: e.clientY });
  }
  $: if (browser) follow(visible);
  function follow(on) {
    if (on) {
      mouse.set({ x: pointer.x + 25, y: pointer.y }, { hard: true });
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
    } else {
      window.removeEventListener('pointermove', handlePointerMove);
    }
  }

  onMount(() => {
    // this might seem 'unsvelty' but it allows this component
    // to be put as a child of any element and it will just work
    const parent = tooltip.parentNode;
    parent.addEventListener('pointerenter', () => (parentHover = true));
    parent.addEventListener('pointerleave', () => (parentHover = false));
    return () => window.removeEventListener('pointermove', handlePointerMove);
  });
</script>

<div
  bind:this={tooltip}
  class:visible
  style:border
  style:background-color={backgroundColor}
  style:top="{$mouse.y}px"
  style:left="{$mouse.x}px">
  <slot />
</div>

<style>
  div {
    pointer-events: none;
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
    transform: translateY(-10px);
    opacity: 0;
    transition:
      transform 200ms,
      opacity 200ms;
  }
  div.visible {
    transform: translateY(0);
    opacity: 1;
  }
</style>
