<script>
  import Filter from '$lib/admin/common/Filter.svelte';
  import Icon from '$lib/common/Icon.svelte';

  // import { createEventDispatcher } from 'svelte';
  // const dispatch = createEventDispatcher();

  export let title;
  export let filters;

  export let selected;
</script>

<div class="filters">
  <div class="icon" title="Filtrowanie">
    <Icon name="filter" />
  </div>
  {title}
  {#each filters as filter}
    <Filter {...filter} bind:selected />
  {/each}
</div>

<style>
  .filters {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 0.5rem;
  }
  .icon {
    height: 1.5em;
  }
</style>
