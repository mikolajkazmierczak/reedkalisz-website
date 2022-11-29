<script>
  import { goto } from '$app/navigation';
  import Icon from '$c/Icon.svelte';

  export let value;

  function handleKeydown(event) {
    if (event.key === 'Enter') search();
  }

  function search() {
    const query = value.trim();
    if (query) goto(`/produkty?q=${query}`);
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
    height: 30px;
  }
  input {
    outline: none;
    border-radius: 15px;
    border: 2px solid var(--main-6);
    padding: 10px 2.5rem 10px 0.75rem;
    height: 100%;
    font-size: 1rem;
  }
  .icon {
    cursor: pointer;
    border-radius: 20px;
    position: absolute;
    right: 2px;
    top: 2px;
    padding: 2px;
    height: 26px;
    width: 34px;
    background-color: var(--main-0);
  }
  .icon:hover {
    background-color: var(--main-1);
  }
</style>
