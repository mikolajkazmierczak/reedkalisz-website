<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let action = false;
  export let edited = false;
  export let disabled = false;

  export let icon = null;
</script>

<button on:click|preventDefault={() => (disabled ? {} : dispatch('click'))} class:action class:edited class:disabled>
  {#if icon}<img src="/icon/{icon}" alt={icon} class:margin={$$slots.default} />{/if}
  {#if $$slots.default}<slot />{/if}
</button>

<style>
  button {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    width: 100%;
    height: 2rem;
    color: #fff;
    font-size: 1.1rem;
  }
  button:hover {
    background-color: var(--main-light);
  }
  .action {
    background-color: var(--main);
  }
  .edited {
    outline: solid 0.15rem var(--c-action);
    outline-offset: 0.25rem;
  }
  .disabled {
    cursor: not-allowed;
    background-color: var(--grey-light);
  }
  .disabled:hover {
    background-color: var(--grey-light);
  }

  img.margin {
    margin-right: 0.5rem;
  }
</style>
