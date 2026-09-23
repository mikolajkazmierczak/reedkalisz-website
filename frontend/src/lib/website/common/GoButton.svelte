<script>
  import { goto } from '$app/navigation';

  export let text = 'BUTTON';
  export let arrow = true;
  export let arrowLeft = false;

  export let fontSize = null;

  export let href = null;
  export let target = '_self';

  export let onclick = null;

  if (href && onclick) {
    throw new Error('GoButton: href and onclick cannot be used together');
  }

  function handleClick() {
    if (href) {
      if (target == '_self') {
        goto(href);
      } else if (target == '_blank') {
        window.open(href, '_blank')?.focus();
      } else {
        throw new Error('GoButton: invalid target');
      }
    } else if (onclick) {
      onclick();
    }
  }
</script>

<!-- Label first so the baseline is the text's, not the svg's; order is flipped with flex-direction. -->
<button class="go" class:reverse={arrowLeft} type="button" on:click={handleClick} style:font-size={fontSize}>
  <span>{text}</span>
  {#if arrow}
    <svg class="go__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path
        d={arrowLeft ? 'M19 12H5M11 6l-6 6 6 6' : 'M5 12h14M13 6l6 6-6 6'}
        stroke-linecap="round"
        stroke-linejoin="round" />
    </svg>
  {/if}
</button>

<style>
  .go {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
    min-height: 2.625rem;
    padding: 0 var(--sp-5);
    border: none;
    border-radius: var(--r-pill);
    background-color: var(--accent);
    color: var(--accent-contrast);
    font-size: var(--fs-sm);
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color var(--dur) var(--ease);
  }
  .go:hover {
    background-color: var(--accent-hover);
  }
  .go:active {
    background-color: var(--red-deep);
  }

  .go.reverse {
    flex-direction: row-reverse;
  }
  .go:not(.reverse) {
    flex-direction: row;
  }

  .go__icon {
    width: 1rem;
    height: 1rem;
    transition: transform var(--dur) var(--ease);
  }
  .go:not(.reverse):hover .go__icon {
    transform: translateX(3px);
  }
  .go.reverse:hover .go__icon {
    transform: translateX(-3px);
  }
</style>
