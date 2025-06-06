<script>
  import { createEventDispatcher } from 'svelte';

  import { editing } from '#/layout/store';
  import ElementLabel from '#/layout/ElementLabel.svelte';

  const dispatch = createEventDispatcher();

  export let types;

  function handleAdd(type) {
    dispatch('add', { type });
  }
</script>

{#if $editing}
  <div class="wrapper">
    {#each types as { type, label, icon }}
      <ElementLabel {label} {icon} onclick={() => handleAdd(type)} />
    {/each}
  </div>
{/if}

<style>
  .wrapper {
    display: flex;
    gap: 0.25rem;
  }
</style>
