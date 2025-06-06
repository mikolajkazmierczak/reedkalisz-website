<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let label;
  export let value;
  export let children = null;

  export let selected;

  $: active = selected === value;

  function handleClick() {
    selected = value;
    dispatch('change', { value });
  }

  function propagate(e) {
    dispatch('change', { value: e.detail.value });
  }
</script>

<div class="wrapper">
  <button class="filter" class:active disabled={active} on:click={handleClick}>{label}</button>
  {#if children}
    {#each children as filter}
      <svelte:self {...filter} bind:selected on:change={propagate} />
    {/each}
  {/if}
</div>

<style>
  .wrapper {
    --radius: 100px;
    display: flex;
    gap: 0.5rem;
    border-radius: var(--radius);
    background-color: var(--primary-white);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25) inset;
  }
  .filter {
    cursor: pointer;
    user-select: none;
    display: grid;
    place-items: center;
    border-radius: var(--radius);
    border: var(--border);
    padding: 0.2rem 0.75rem;
    transition:
      background-color 100ms,
      color 100ms;
    font-size: 0.9em;
    background-color: var(--light);
  }
  .filter:hover {
    background-color: var(--accent-light);
  }
  .filter.active {
    background-color: var(--primary-white);
  }
</style>
