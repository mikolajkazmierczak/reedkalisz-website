<script>
  import { goto } from '$app/navigation';
  import Icon from '$c/Icon.svelte';

  export let value;

  function handleKeydown(event) {
    if (event.key === 'Enter') search();
  }

  function search() {
    const query = value.trim();
    if (query) goto(`/?q=${query}`);
  }
</script>

<div class="wrapper">
  <input type="text" placeholder="Szukaj..." bind:value on:keydown={handleKeydown} />
  <div class="icon" on:click={search}>
    <Icon name="search" />
  </div>
</div>

<style>
  .wrapper {
    position: relative;
    margin-bottom: 10px;
    width: 100%;
    height: 2.25rem;
  }
  input {
    outline: none;
    border-radius: 15px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 10px 2.5rem 10px 0.75rem;
    height: 100%;
    font-size: 1rem;
  }
  .icon {
    cursor: pointer;
    border-radius: 15px;
    position: absolute;
    right: 0.3rem;
    top: 0.25rem;
    padding: 0.25rem;
    height: calc(100% - 0.5rem);
    width: 34px;
    background-color: var(--grey);
  }
  .icon:hover {
    background-color: var(--main-1);
  }
</style>
