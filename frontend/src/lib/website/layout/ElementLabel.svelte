<script>
  import Icon from '$c/Icon.svelte';

  export let label;
  export let icon;

  export let onclick = null;
</script>

<button class="label" class:onclick style:cursor={onclick ? 'pointer' : 'default'} on:click={onclick}>
  <Icon name={icon} width="1.1rem" color="var(--main-3)" />
  {label}
</button>

<style>
  .label {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    border: 0;
    padding: 0 0.3rem;
    height: 1.25rem;
    background-color: var(--main-1);
    font-size: 0.9rem;
    text-transform: uppercase;
    font-weight: bold;
    color: var(--main-3);
  }
  .label.onclick {
    cursor: pointer;
  }
  .label.onclick:hover {
    background-color: var(--main-0);
  }
</style>
