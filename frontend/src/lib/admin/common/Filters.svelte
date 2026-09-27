<script>
  import { createEventDispatcher } from 'svelte';
  import Filter from './Filter.svelte';

  const dispatch = createEventDispatcher();

  export let filters;

  export let selected;

  function propagate(e) {
    dispatch('change', { value: e.detail.value });
  }
</script>

<div class="filters">
  {#each filters as filter}
    <Filter {...filter} {selected} on:change={propagate} />
  {/each}
</div>

<style>
  .filters {
    display: flex;
    flex-wrap: wrap; /* (a phone: on more lines) */
    align-items: center;
    gap: 0.25rem;
  }
</style>
