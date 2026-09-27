<script>
  import Icon from '$c/Icon.svelte';
  import Button from '@c/Button.svelte';
  import Input from '@c/Input.svelte';
  import { fly } from 'svelte/transition';

  export let searchParams = null;
  export let query;

  let input;
  $: value = query; // query might be given from above

  function set(q) {
    searchParams?.set({ q });
    query = q;
  }

  // clear search when value is emptied (either manually or by clicking the clear button)
  $: if (!value && query) set(null);

  const clear = () => (value = null);
  const search = () => !!value && set(String(value).trim()); // a number when it comes from ?q=123
</script>

<svelte:window
  on:keydown={(e) => {
    // Enter in the field searches
    if (e.key === 'Enter' && e.target === input) search();
    // Ctrl+Q: into the field, its text selected
    if (e.ctrlKey && e.key == 'q') {
      e.preventDefault();
      e.stopPropagation();
      input.focus();
      input.select();
    }
  }} />

<!-- the field and its button one piece, as round as the buttons -->
<div class="wrapper">
  {#if !!query}
    <button class="clear" aria-label="Wyczyść" on:click={clear} transition:fly={{ x: 25, duration: 200 }}>
      <div class="icon"><Icon fill name="arrow_clockwise" color="var(--navy-700)" /></div>
    </button>
  {/if}

  <div class="search" role="search">
    <div class="input-wrapper">
      <Input
        bind:value
        bind:input
        placeholder="Szukaj..."
        borderRadius="var(--button-radius) 0 0 var(--button-radius)" />
      {#if !value}
        <div class="shortcut-info" in:fly={{ x: 50, duration: 500 }}>Ctrl+Q</div>
      {/if}
    </div>
    <Button
      icon="search"
      title="Szukaj"
      on:click={search}
      borderRadius="0 var(--button-radius) var(--button-radius) 0" />
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .clear {
    cursor: pointer;
    height: 1.5625rem;
    width: 1.5625rem;
    padding: 0.25rem;
    border-radius: var(--border-radius);
    corner-shape: squircle;
    border: solid 1px var(--edge);
    background-color: transparent;
    transition: background-color 0.1s ease;
  }
  .clear:hover {
    background-color: var(--blue-100);
  }

  .search {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .input-wrapper {
    position: relative;
  }
  /* it runs into its button: no edge between them */
  .input-wrapper :global(input) {
    border-right: none;
  }
  .shortcut-info {
    position: absolute;
    top: 50%;
    right: 0.4rem;
    transform: translateY(-50%);
    border-radius: var(--border-radius);
    corner-shape: squircle;
    padding: 0.2rem 0.4rem;
    font-size: 0.75rem;
    color: var(--text);
    opacity: 0.5;
    background-color: var(--black-10);
  }
</style>
