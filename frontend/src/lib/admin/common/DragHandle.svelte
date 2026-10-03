<script>
  import { createEventDispatcher, tick } from 'svelte';
  import Icon from '$c/Icon.svelte';

  // What a tile is dragged by (see sortable.js), a small button in its corner. From the keyboard the arrows move it a
  // place back or on (`on:step`, -1 or 1), the focus staying on it.
  export let disabled = false;
  const dispatch = createEventDispatcher();

  let button;
  async function keydown(e) {
    const step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
    if (!step || disabled) return;
    e.preventDefault();
    dispatch('step', step);
    await tick();
    button.focus();
  }
</script>

<button
  type="button"
  class="handle"
  data-handle
  title="Przeciągnij, żeby zmienić kolejność (albo strzałki)"
  aria-label="Zmień kolejność"
  {disabled}
  bind:this={button}
  on:keydown={keydown}>
  <Icon fill name="drag" dark />
</button>

<style>
  /* as a small secondary button (see Button) */
  .handle {
    flex: none;
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0.2rem;
    border: none;
    border-radius: var(--button-radius-small);
    corner-shape: squircle;
    background-color: var(--grey-100);
    cursor: grab;
    touch-action: none; /* a finger on it drags, not scrolls */
  }
  .handle:not([disabled]):hover {
    background-color: var(--blue-100);
  }
  .handle:not([disabled]):active {
    cursor: grabbing;
    background-color: var(--grey-300);
  }
  .handle:focus-visible {
    outline: solid 2px var(--navy-700);
    outline-offset: 1px;
  }
  .handle[disabled] {
    cursor: default;
    opacity: 0.4;
  }
</style>
