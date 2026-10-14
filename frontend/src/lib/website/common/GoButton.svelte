<script>
  import { goto } from '$app/navigation';

  export let text = 'BUTTON';
  export let href = null;
  export let target = '_self';

  function handleClick() {
    if (!href) return;
    if (target == '_self') goto(href);
    else if (target == '_blank') window.open(href, '_blank')?.focus();
    else throw new Error('GoButton: invalid target');
  }
</script>

<!-- Label first so the baseline is the text's, not the svg's. -->
<button class="go" type="button" on:click={handleClick}>
  <span>{text}</span>
  <svg class="go__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
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
    transition: background-color var(--dur) var(--ease-hover);
  }
  .go:hover {
    background-color: var(--accent-hover);
  }
  .go:active {
    background-color: var(--red-deep);
  }

  .go__icon {
    width: 1rem;
    height: 1rem;
    transition: transform var(--dur) var(--ease);
  }
  .go:hover .go__icon {
    transform: translateX(0.1875rem);
  }
</style>
