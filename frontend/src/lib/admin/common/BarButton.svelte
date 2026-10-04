<script context="module">
  // the icons' outline, thickened to go with the bold labels (Icon's own is 0.3: the regular weight)
  export const barIconStroke = 0.9;
</script>

<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from '$c/Icon.svelte';

  // A button of the top bars (the page header and the editor's): slightly squircled corners, a navy outline,
  // filled navy when `active` (e.g. the current tab). A link with `href`.
  const dispatch = createEventDispatcher();

  export let href = null;
  export let icon = null;
  export let active = false;
  export let dangerous = false; // red outline and icon: the only colour the bars have
  export let warn = false; // something to look at there: an orange ring around its outline
  export let square = false; // just the icon
  export let disabled = false;
  export let hoverColor = null;
  export let title = null;

  $: hover = hoverColor ?? (dangerous ? 'var(--red-100)' : active ? 'var(--navy-500)' : 'var(--blue-100)');
  $: iconColor = dangerous ? 'var(--red-500)' : active ? 'var(--light)' : 'var(--text)';
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  {href}
  {title}
  aria-label={$$slots.default ? null : title}
  aria-current={href && active ? 'page' : undefined}
  class="bar-button"
  class:active
  class:dangerous
  class:square
  class:disabled
  aria-disabled={disabled || undefined}
  style:--hover={hover}
  class:warn
  role={href ? 'link' : 'button'}
  on:click={(e) => {
    if (!href) {
      e.preventDefault();
      if (!disabled) dispatch('click');
    }
  }}>
  <slot name="icon">
    {#if icon}<span class="icon"><Icon fill name={icon} color={iconColor} strokeWidth={barIconStroke} /></span>{/if}
  </slot>
  {#if $$slots.default}<span class="label"><slot /></span>{/if}
</svelte:element>

<style>
  .bar-button {
    cursor: pointer;
    overflow: hidden;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    border: solid 1.5px var(--navy-700);
    border-radius: var(--border-radius);
    corner-shape: squircle;
    padding: 0 1rem;
    height: var(--bar-button); /* see ui-admin.css */
    font-size: 0.95rem;
    text-decoration: none;
    white-space: nowrap;
    color: var(--text);
    background-color: rgb(from var(--paper) r g b / 0.6); /* the paper, the board showing faintly through */
    transition: background-color 120ms;
  }
  .bar-button:not(.disabled):hover {
    background-color: var(--hover);
  }
  .bar-button:focus-visible {
    outline: solid 2px var(--navy-700);
    outline-offset: 2px;
  }
  .disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .square {
    padding: 0;
    aspect-ratio: 1.2 / 1;
  }
  .active {
    color: var(--light);
    background-color: var(--navy-700);
  }
  /* the page you're on: nothing to click */
  a.active {
    cursor: default;
    pointer-events: none;
  }
  /* a ring just outside the border */
  .warn {
    outline: solid 2px var(--orange-500);
    outline-offset: 1px;
  }
  .dangerous {
    border-color: var(--red-500);
    color: var(--red-500);
  }
  .bar-button :global(.icon),
  .label {
    z-index: 1;
    position: relative;
  }
  .label {
    color: inherit; /* the admin styles give every element a colour */
    font-weight: 700;
  }
  .bar-button :global(.icon) {
    display: flex;
    height: 65%;
    aspect-ratio: 1 / 1;
  }
</style>
