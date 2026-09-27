<script>
  import Icon from '$c/Icon.svelte';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // Every variant is a background, and the ones on hover and when pressed (no animation, it just changes).
  // `background`, `backgroundHover`, `backgroundActive` override them.
  export let secondary = false; // light, dark text
  export let dangerous = false; // dark, red on hover
  export let dashed = false; // a quiet "add something" button: dashed outline, no fill
  export let ghost = false; // just the icon or label, e.g. inside a chip or a table cell
  export let outline = false; // a light pill with a faint border, e.g. a choice between companies
  export let selected = false; // the chosen one of a few (purplish), e.g. the company picked
  export let edge = false; // a light one on a grey or dotted page: a ring a shade darker than its fill
  // a state in colour: 'info' (light blue), 'selected' (purplish), 'success' (green), 'warning' (orange), 'danger' (red)
  export let tone = null;
  export let square = false;
  export let small = false;

  export let background = null;
  export let backgroundHover = null;
  export let backgroundActive = null;

  export let disabled = false;

  export let width = 'auto';
  export let icon = null;
  export let title = null; // what an icon-only button does, on hover
  export let label = null; // what it does for a screen reader, when a Tooltip shows it instead of the title
  export let start = false; // content from the left, e.g. a whole row of a tree
  export let borderRadius = null; // its own (e.g. joined to a field, see Search); else a squircle by its size

  $: shade = selected ? 'selected' : tone;
  $: dark = secondary || dashed || ghost || outline || !!shade; // dark text and icon on a light background
  // just an icon: always a square
  $: squared = square || (!!icon && !$$slots.default);
</script>

<button
  {title}
  aria-label={$$slots.default ? null : (label ?? title)}
  on:click|preventDefault={() => (disabled ? {} : dispatch('click'))}
  class:secondary
  class:dangerous
  class:dashed
  class:edge
  class:ghost
  class:outline
  class:tone-info={shade === 'info'}
  class:tone-selected={shade === 'selected'}
  class:tone-success={shade === 'success'}
  class:tone-warning={shade === 'warning'}
  class:tone-danger={shade === 'danger'}
  class:dark
  class:square={squared}
  class:small
  {disabled}
  style:--bg={background}
  style:--bg-hover={backgroundHover}
  style:--bg-active={backgroundActive}
  style:border-radius={borderRadius}
  style:width>
  <div class="content" class:label={$$slots.default} class:square={squared} class:small class:start>
    {#if icon}<Icon height="58%" name={icon} light={!dark} {dark} color={disabled ? 'var(--grey-500)' : null} />{/if}
    {#if $$slots.default}<slot />{/if}
  </div>
</button>

<style>
  button {
    --bg: var(--navy-700);
    --bg-hover: var(--navy-500);
    --bg-active: var(--navy-900);
    cursor: pointer;
    overflow: hidden;
    position: relative;
    border: none;
    padding: 0;
    height: 2rem;
    border-radius: var(--button-radius);
    corner-shape: squircle; /* rounder than the fields; the top bars' (BarButton) stay sharp */
    background-color: var(--bg);
  }
  button:hover {
    background-color: var(--bg-hover);
  }
  button:active {
    background-color: var(--bg-active);
  }
  button.square {
    flex-shrink: 0; /* a row running out of room squeezes it out of shape otherwise */
    aspect-ratio: 1 / 1;
  }
  button.small {
    border-radius: var(--button-radius-small);
    height: 1.5rem;
  }

  .dangerous {
    --bg: var(--navy-900);
    --bg-hover: var(--red-400);
    --bg-active: var(--red-500);
  }
  .secondary {
    --bg: var(--grey-100);
    --bg-hover: var(--blue-100);
    --bg-active: var(--grey-300);
  }
  .dashed,
  .ghost {
    --bg: transparent;
    --bg-hover: var(--black-6);
    --bg-active: var(--black-10);
  }
  .dashed {
    outline: dashed 1px var(--grey-500);
    outline-offset: -1px;
  }
  .dashed:hover {
    outline-color: var(--navy-700);
  }
  .edge {
    box-shadow: inset 0 0 0 1px var(--edge);
  }
  .outline {
    --bg: var(--light);
    --bg-hover: var(--blue-100);
    --bg-active: var(--navy-100);
    box-shadow: 0 0 0 1px var(--black-10) inset;
  }
  .tone-info {
    --bg: var(--blue-100);
    --bg-hover: var(--blue-200);
    --bg-active: var(--blue-300);
  }
  .tone-selected {
    --bg: var(--navy-100);
    --bg-hover: var(--navy-200);
    --bg-active: var(--navy-300);
  }
  .tone-success {
    --bg: var(--green-100);
    --bg-hover: var(--green-200);
    --bg-active: var(--green-300);
  }
  .tone-warning {
    --bg: var(--orange-100);
    --bg-hover: var(--orange-200);
    --bg-active: var(--orange-300);
  }
  .tone-danger {
    --bg: var(--red-100);
    --bg-hover: var(--red-200);
    --bg-active: var(--red-300);
  }

  .content {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 1rem;
    width: 100%;
    height: 100%;
    color: var(--light);
    font-size: 0.95rem;
  }
  .dark .content {
    color: var(--text);
  }
  .content.label {
    gap: 0.5rem;
  }
  .content.start {
    justify-content: flex-start;
  }
  .content :global(:not(svg, svg *)) {
    color: inherit; /* what's put in a button takes its colour (the admin styles colour every element) */
  }
  .content.square {
    padding: 0;
  }
  .content.small {
    gap: 0.25rem;
    font-size: 0.85rem;
  }
  .content.small:not(.square) {
    /* `:not` so it doesn't override the square padding and squeeze the icon sideways */
    padding: 0 0.5rem;
  }

  [disabled],
  [disabled]:hover,
  [disabled]:active {
    cursor: not-allowed;
    background-color: var(--grey-100);
  }
  [disabled] .content {
    color: var(--grey-500);
  }
</style>
