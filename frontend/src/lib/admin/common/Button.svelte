<script>
  import HoverCircle from '$c/HoverCircle.svelte';
  import Icon from '$c/Icon.svelte';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let secondary = false;
  export let dangerous = false;
  export let square = false;

  export let edited = false;
  export let disabled = false;

  export let width = 'auto';
  export let icon = null;
  export let borderRadius = 'var(--border-radius)';

  $: hoverColor = dangerous ? 'var(--main)' : secondary ? 'var(--accent-light)' : 'var(--primary-light)';
</script>

<button
  on:click|preventDefault={() => (disabled ? {} : dispatch('click'))}
  class:secondary
  class:dangerous
  class:square
  class:edited
  {disabled}
  style:border-radius={borderRadius}
  style:width
>
  {#if !disabled}
    <HoverCircle color={hoverColor} />
  {/if}
  <div class="content" class:label={$$slots.default} class:square>
    {#if icon}<Icon height="58%" name={icon} light={!secondary} dark={secondary} />{/if}
    {#if $$slots.default}<slot />{/if}
  </div>
</button>

<style>
  button {
    cursor: pointer;
    overflow: hidden;
    position: relative;
    border: none;
    padding: 0;
    height: 2rem;
    background-color: var(--primary);
  }
  button.square {
    aspect-ratio: 1 / 1;
  }
  .dangerous {
    background-color: var(--primary-dark);
  }
  .content {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 1rem;
    width: 100%;
    height: 100%;
    font-size: 1.1rem;
    color: var(--primary-text);
    font-size: 0.95rem;
  }
  .content.label {
    gap: 0.5rem;
  }
  .content.square {
    padding: 0;
  }
  .secondary .content {
    color: var(--accent-text);
  }

  .edited {
    outline: solid 0.15rem var(--main);
    outline-offset: 0.25rem;
  }

  [disabled] {
    cursor: not-allowed;
    background-color: var(--accent-white);
  }
</style>
