<script>
  export let onclick;
  export let submit = false;
</script>

{#if submit}
  <button type="submit" on:click|preventDefault={onclick}><slot /></button>
{:else}
  <button on:click={onclick}><slot /></button>
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
