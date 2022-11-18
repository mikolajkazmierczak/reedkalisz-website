<script>
  import { fly } from 'svelte/transition';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Icon from '$c/Icon.svelte';

  export let query;
  let value;

  let input;

  function search() {
    if (!!value) query = value.trim();
  }
  function clear() {
    value = null;
  }

  // clear search when value is emptied (either manually or by clicking the clear button)
  $: if (!value && query) {
    query = null;
  }
</script>

<svelte:window
  on:keydown={e => {
    // check if ctrl+f is pressed
    if (e.ctrlKey && e.key == 'q') {
      e.preventDefault();
      e.stopPropagation();
      // focus on input
      input.focus();
      // select all text
      input.select();
    }
  }}
/>

<div class="wrapper">
  {#if !!query}
    <button class="clear" on:click={clear} transition:fly={{ x: 25, duration: 200 }}>
      <div class="icon"><Icon name="arrow_clockwise" color="var(--primary)" /></div>
    </button>
  {/if}

  <div
    class="search"
    on:keypress={e => {
      if (e.key === 'Enter') search();
    }}
  >
    <div class="input-wrapper">
      <Input
        bind:value
        bind:input
        placeholder="Szukaj..."
        borderRadius="var(--border-radius) 0 0 var(--border-radius)"
      />
      {#if !value}
        <div class="shortcut-info" in:fly={{ x: 50, duration: 500 }}>Ctrl+Q</div>
      {/if}
    </div>
    <Button icon="search" on:click={search} borderRadius="0 var(--border-radius) var(--border-radius) 0" />
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
    height: 25px;
    width: 25px;
    padding: 0.25rem;
    border-radius: var(--border-radius);
    border: solid 1px var(--accent);
    /* border: none; */
    background-color: transparent;
    transition: background-color 0.1s ease;
  }
  .clear:hover {
    background-color: var(--accent-light);
  }

  .search {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .input-wrapper {
    position: relative;
  }
  .shortcut-info {
    position: absolute;
    top: 50%;
    right: 0.4rem;
    transform: translateY(-50%);
    border-radius: var(--border-radius);
    /* border: solid 1px var(--primary-light); */
    padding: 0.2rem 0.4rem;
    font-size: 0.75rem;
    color: #000;
    opacity: 0.5;
    background-color: rgba(0, 0, 0, 0.1);
  }
</style>
