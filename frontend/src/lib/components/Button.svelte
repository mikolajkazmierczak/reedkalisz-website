<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let submit = false;
</script>

{#if submit}
  <button type="submit" on:click|preventDefault={() => dispatch('click')}><slot /></button>
{:else}
  <button on:click={() => dispatch('click')}><slot /></button>
{/if}

<style>
  button {
    background-color: var(--main);
    color: var(--light);
    border: none;
    padding: 0.5rem;
    height: 2.5rem;
  }
  button:hover {
    background-color: var(--main-light);
  }
</style>
