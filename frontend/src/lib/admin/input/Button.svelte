<script>
  import HoverCircle from '$lib/components/HoverCircle.svelte';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let secondary = false;
  export let dangerous = false;
  export let square = false;

  export let edited = false;
  export let disabled = false;

  export let icon = null;

  $: hoverColor = dangerous ? 'var(--main)' : secondary ? 'var(--accent-light)' : 'var(--primary-light)';
</script>

<button
  on:click|preventDefault={() => (disabled ? {} : dispatch('click'))}
  class:secondary
  class:edited
  class:dangerous
  class:square
  {disabled}
>
  {#if !disabled}
    <HoverCircle color={hoverColor} />
  {/if}
  <div class="content">
    {#if icon}
      <img src="/icons/{secondary ? 'dark' : 'light'}/{icon}" alt={icon} class:margin={$$slots.default} />
    {/if}
    {#if $$slots.default}<slot />{/if}
  </div>
</button>

<style>
  button {
    cursor: pointer;
    overflow: hidden;
    position: relative;
    border-radius: 0.5rem;
    border: none;
    /* width: 100%; */
    height: 2rem;
    background-color: var(--primary);
  }
  .dangerous {
    background-color: var(--primary-dark);
  }
  .square {
    border-radius: 0;
  }
  .content {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.25rem 1rem;
    width: 100%;
    height: 100%;
    font-size: 1.1rem;
    color: var(--primary-text);
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

  img {
    height: 100%;
  }
  img.margin {
    margin-right: 0.5rem;
  }
</style>
