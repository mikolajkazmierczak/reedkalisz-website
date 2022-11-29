<script>
  import Icon from '$c/Icon.svelte';
  import Filter from './Filter.svelte';

  export let title;
  export let filters;

  export let selected;
</script>

<div class="filters">
  {#if title}
    <div class="icon" title="Filtrowanie">
      <Icon name="filter" />
    </div>
    {title}
  {/if}
  {#each filters as filter}
    <Filter {...filter} bind:selected />
  {/each}
</div>

<style>
  .filters {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .icon {
    height: 1.5em;
  }
</style>
