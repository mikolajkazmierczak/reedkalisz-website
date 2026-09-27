<script context="module">
  // the icons' outline, thickened to go with the bold labels (Icon's own is 0.3: the regular weight)
  export const barIconStroke = 0.9;
</script>

<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from '$c/Icon.svelte';

  // A button of the top bars (the page header and the editor's): square corners, a black outline,
  // filled black when `active` (e.g. the current tab). A link with `href`.
  const dispatch = createEventDispatcher();

  export let href = null;
  export let icon = null;
  export let active = false;
  export let dangerous = false; // red outline and icon: the only colour the bars have
  export let warn = false; // something to look at there: a thin orange ring inside its outline
  export let square = false; // just the icon
  export let disabled = false;
  export let hoverColor = null;
  export let title = null;

  $: hover = hoverColor ?? (dangerous ? 'var(--red-100)' : active ? 'var(--navy-500)' : 'var(--blue-100)');
  // (a background on hover, no animation)
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
    border: solid 2px var(--text);
    border-radius: 0;
    padding: 0 1rem;
    height: 2rem;
    font-size: 0.95rem;
    text-decoration: none;
    white-space: nowrap;
    color: var(--text);
    background-color: transparent;
  }
  .bar-button:hover {
    background-color: var(--hover);
  }
  .disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .disabled:hover {
    background-color: transparent;
  }
  .square {
    padding: 0;
    aspect-ratio: 1.2 / 1;
  }
  .active {
    color: var(--light);
    background-color: var(--text);
  }
  /* the page you're on: nothing to click */
  a.active {
    cursor: default;
    pointer-events: none;
  }
  /* inside the border, which stays as it is, a little gap between them (the border 2px, the gap 1.5px) */
  .warn {
    outline: solid 1.5px var(--orange-500);
    outline-offset: -5px;
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
