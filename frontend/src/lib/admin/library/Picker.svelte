<script>
  import { fly, fade } from 'svelte/transition';

  import api from '$lib/api';
  import { read as fields } from '$lib/fields/files';
  import File from '$lib/admin/library/File.svelte';
  import Library from '$lib/admin/library/Library.svelte';

  export let types = [];

  let opened;

  export let id;
  let file;

  async function read() {
    if (id) file = await api.files.readOne(id, { fields });
  }

  read();

  function handleSelect(e) {
    file = e.detail;
    id = file.id;
    opened = false;
    console.log(selected);
  }
</script>

<svelte:head>
  {#if opened}
    <style>
      body {
        /* overflow: hidden; */
      }
    </style>
  {/if}
</svelte:head>

<File {...file} on:click={() => (opened = true)} />

{#if opened}
  <div class="bg" transition:fade={{ duration: 200 }} />
  <div class="wrapper" on:click|self={() => (opened = false)}>
    <div class="library" transition:fly={{ y: -50, duration: 200 }}>
      <Library picker {types} selected={id} on:select={handleSelect} />
    </div>
  </div>
{/if}

<style>
  .bg,
  .wrapper {
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    padding: 1rem;
    width: 100%;
    height: 100%;
  }
  .bg {
    background-color: rgba(0, 0, 0, 0.5);
  }
  .wrapper {
    overflow-y: auto;
    border-radius: 1rem;
  }
  .library {
    border-radius: 1rem;
    padding: 1rem;
    width: 100%;
    background-color: var(--accent-white);
    background-image: url('/imgs/dot_grid.png');
    background-size: 160px;
  }
</style>
