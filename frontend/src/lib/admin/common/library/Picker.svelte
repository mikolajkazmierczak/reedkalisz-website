<script>
  import { fade, fly } from 'svelte/transition';

  import api from '$/api';
  import { read as fields } from '%/fields/directus_files';

  import Button from '@c/Button.svelte';
  import File, { fileProps } from '@c/library/File.svelte';
  import Library from '@c/library/Library.svelte';
  import { portal } from '@/portal';

  let opened;

  export let selected;
  export let fileContext = null; // in a product: { used, history } file ids, shown first
  export let backing = null; // on the dots (a page's): its tile's text on their grey (see File)
  let file;
  let fileData; // just what File shows

  function close() {
    opened = false;
  }

  function handleSelect(e) {
    file = e.detail;
    fileData = fileProps(file);
    selected = file.id;
    close();
  }

  async function read(id) {
    if (id && file?.id === id) return; // just picked in the library, read there already
    if (id) file = await api.files.readOne(id, { fields });
    else file = null;
    fileData = file ? fileProps(file) : null;
  }

  $: read(selected);
</script>

<File {...fileData} marked={false} {backing} on:click={() => (opened = true)} />

{#if opened}
  <div class="bg" use:portal transition:fade={{ duration: 200 }} />
  <div class="wrapper" role="presentation" use:portal on:click|self={close}>
    <div class="library" transition:fly={{ y: -50, duration: 200 }}>
      <Library picker {fileContext} bind:selected on:select={handleSelect}>
        <svelte:fragment slot="actions">
          <Button icon="close" on:click={close}>Anuluj</Button>
          {#if selected}
            <Button icon="delete" dangerous on:click={() => (selected = null)}>Wyczyść</Button>
          {/if}
        </svelte:fragment>
      </Library>
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
    background-color: var(--black-50);
  }
  .wrapper {
    overflow-y: auto;
    border-radius: 1rem;
  }
  .library {
    border-radius: 1rem;
    corner-shape: squircle;
    padding: 1rem;
    width: 100%;
    background-color: var(--grey-100);
    background-image: url('/imgs/dot_grid.png');
    background-size: 10rem;
  }
</style>
