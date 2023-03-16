<script>
  import { goto } from '$app/navigation';

  export let value;

  function handleKeydown(event) {
    if (event.key === 'Enter') search();
  }

  function search() {
    const query = value.trim();
    if (query) goto(`/kategorie/_?q=${query}`);
  }
</script>

<div class="wrapper">
  <input type="text" placeholder="Czego potrzebujesz?" bind:value on:keydown={handleKeydown} />
  <button on:click={search}>SZUKAJ</button>
</div>

<style>
  .wrapper {
    --border: 2px solid var(--main);
    display: flex;
    position: relative;
    border: var(--border);
    height: 2.5rem;
  }
  input {
    outline: none;
    border: none;
    padding: 0 0.75rem;
    height: 100%;
    font-size: 1rem;
    width: 25ch;
    color: var(--main);
  }
  input::placeholder {
    color: rgb(0, 0, 0, 0.4);
  }
  button {
    cursor: pointer;
    border: none;
    border-left: var(--border);
    text-transform: uppercase;
    font-weight: 500;
    font-size: 0.8rem;
    color: var(--main);
    background-color: var(--white);
  }
  button:hover {
    background-color: var(--main);
    color: var(--white);
  }
</style>
