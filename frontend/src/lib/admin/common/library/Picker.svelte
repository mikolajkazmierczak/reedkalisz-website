<script>
  import { fly, fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  import api from '$/api';
  import { read as fields } from '$/fields/files';
  import File from '@c/library/File.svelte';
  import Library from '@c/library/Library.svelte';

  const dispatch = createEventDispatcher();

  export let selected;
  let file;

  let opened;

  async function read(id) {
    if (id) file = await api.files.readOne(id, { fields });
  }

  function handleSelect(e) {
    opened = false;
    file = e.detail;
    selected = file.id;
    dispatch('select', file);
  }

  $: read(selected);
</script>

<File {...file} on:click={() => (opened = true)} />

{#if opened}
  <div class="bg" transition:fade={{ duration: 200 }} />
  <div class="wrapper" on:click|self={() => (opened = false)}>
    <div class="library" transition:fly={{ y: -50, duration: 200 }}>
      <Library picker bind:selected on:select={handleSelect} />
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
