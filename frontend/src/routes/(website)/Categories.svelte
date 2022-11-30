<script>
  import { slide, fly } from 'svelte/transition';

  export let categories;

  export let categoryID = null;
  export let parentID = null;
  let selectedID = null;
  $: children = categories.find(c => c.id === selectedID)?.children;

  const depth = categories[0]._meta.depth;
  const root = depth == 1;

  function choose(id) {
    selectedID = selectedID === id ? (parentID ? parentID : null) : id;
    categoryID = selectedID;
  }
</script>

<!-- out:slide={{ duration: 150, delay: 150 }} -->
<!-- out:fly={{ y: -15, duration: 150 }} -->
<div class="wrapper" style:padding-left={20 * (depth - 1) + 'px'} in:slide={{ duration: 150 }}>
  {#each categories as { id, name } (id)}
    <button
      data-sveltekit-prefetch
      class:root
      class:selected={selectedID == id}
      on:click={() => choose(id)}
      in:fly={{ y: -15, duration: 150, delay: 150 }}
    >
      {name}
    </button>
  {/each}
</div>

{#if selectedID && children?.length}
  <svelte:self categories={children} bind:categoryID parentID={selectedID} />
{/if}

<style>
  .wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 2rem;
  }

  button {
    cursor: pointer;
    outline: none;
    border-radius: 200px;
    border: none;
    padding: 5px 20px;
    background-color: var(--grey);
    font-size: 1rem;
    text-decoration: none;
    transition: background-color 100ms;
    white-space: nowrap;
  }
  button.root {
    padding: 10px 20px;
  }
  button:hover,
  button.selected {
    background-color: var(--main-1);
  }
  button.selected {
    outline: 2px solid var(--main);
  }
</style>
