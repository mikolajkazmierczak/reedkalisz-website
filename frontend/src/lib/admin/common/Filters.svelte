<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from '$c/Icon.svelte';
  import Filter from './Filter.svelte';

  const dispatch = createEventDispatcher();

  export let title = null;
  export let filters;

  export let selected;

  function propagate(e) {
    dispatch('change', { value: e.detail.value });
  }
</script>

<div class="filters">
  {#if title}
    <div title="Filtrowanie">
      <Icon height="1.5em" name="filter" />
    </div>
    {title}
  {/if}
  {#each filters as filter}
    <Filter {...filter} bind:selected on:change={propagate} />
  {/each}
</div>

<style>
  .filters {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
