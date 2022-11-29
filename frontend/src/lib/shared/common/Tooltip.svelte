<script>
  import { onMount } from 'svelte';
  import { spring } from 'svelte/motion';

  export let label = null;

  let elem;
  let parent;

  let visible = false;
  let mouse = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.5 });

  onMount(() => {
    // this might seem 'unsvelty' but it allows this component to be put as a child of any element and it will just work
    parent = elem.parentNode;
    parent.addEventListener('mouseenter', () => (visible = true));
    parent.addEventListener('mouseleave', () => (visible = false));
  });
</script>

<svelte:window on:mousemove={e => mouse.set({ x: e.clientX + 25, y: e.clientY })} />

<div bind:this={elem} class="tooltip" class:visible style="top:{$mouse.y}px; left:{$mouse.x}px;">{@html label}</div>

<style>
  .tooltip {
    pointer-events: none;
    z-index: 1000;
    position: fixed;
    border: var(--border);
    padding: 0.25rem 0.5rem;
    background-color: var(--light);
    transform: scale(0);
    transform-origin: top left;
    transition: transform 200ms;
    font-size: 1rem;
  }
  .tooltip.visible {
    transform: scale(1);
  }
</style>
