<script>
  import { spring } from 'svelte/motion';
  import { fly } from 'svelte/transition';
  import Icon from '$c/Icon.svelte';

  import Button from '#/layout/Button.svelte';

  export let open = false;
  let dragging = false;

  let floater;

  let mouseY = 0;
  let mouseX = 0;
  let dragStartOffsetX = 0;
  let dragStartOffsetY = 0;

  const position = spring({ x: 0, y: 0 }, { stiffness: 0.9, damping: 1 });

  $: if (open) {
    setPositionUntracked({ hard: true });
  }
  $: if (dragging) {
    // adjust for where the mouse was on the floater when the drag started
    const x = mouseX - dragStartOffsetX;
    const y = mouseY - dragStartOffsetY;
    setPosition(x, y);
  }

  function dragStart() {
    const { x, y } = floater.getBoundingClientRect();
    dragStartOffsetX = mouseX - x;
    dragStartOffsetY = mouseY - y;
    dragging = true;
  }
  function dragEnd() {
    dragging = false;
  }

  function setPosition(x, y, { hard = false } = {}) {
    // make sure the element doesn't go off screen
    const maxX = window.innerWidth - 50;
    const maxY = window.innerHeight - 50;
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > maxX) x = maxX;
    if (y > maxY) y = maxY;
    position.set({ x, y }, { hard });
  }
  function setPositionUntracked(options) {
    // doesn't trigger updates when mouse position changes
    setPosition(mouseX, mouseY, options);
  }

  function handleMouseMove(e) {
    mouseY = e.clientY;
    mouseX = e.clientX;

    // when mouse is released, stop dragging
    // this is needed because the mouseup event doesn't trigger when the mouse is released outside the window
    if (dragging && e.buttons === 0) dragEnd();
  }
</script>

<svelte:window on:mousemove={handleMouseMove} />

{#if open}
  <div
    bind:this={floater}
    class="floater"
    style:top={$position.y + 'px'}
    style:left={$position.x + 'px'}
    transition:fly={{ duration: 100, y: -5 }}
  >
    <div class="bar">
      <button class="drag" style:cursor={dragging ? 'grabbing' : 'grab'} on:mousedown={dragStart}>
        <Icon name="re_order_dots_vertical" height="80%" color="var(--main-2)" />
      </button>
      <Button icon="close" onclick={() => (open = false)} />
    </div>
    <div class="inputs">
      <slot />
    </div>
  </div>
{/if}

<style>
  .floater {
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    border: 1px solid var(--main-2);
  }

  .bar {
    display: flex;
  }
  .drag {
    flex-grow: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 0;
    border: none;
    padding: 0;
    height: 1.25rem;
    background-color: var(--main-0);
  }
  .inputs {
    display: grid;
    grid-template-columns: auto 20ch auto;
    row-gap: 0.5rem;
    column-gap: 0.25rem;
    padding: 0.25rem;
    background-color: var(--main-1);
  }
</style>
