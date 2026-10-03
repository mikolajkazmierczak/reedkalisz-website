<script>
  import api from '$/api';
  import { read as fields } from '%/fields/directus_files';

  import Button from '@c/Button.svelte';
  import File, { fileProps } from '@c/library/File.svelte';
  import Library from '@c/library/Library.svelte';
  import Modal from '@c/Modal.svelte';

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
  <!-- the library's own bar on top, not the frosted one -->
  <Modal type="fill" dotted closeText={null} on:close={close}>
    <Library picker {fileContext} bind:selected on:select={handleSelect}>
      <svelte:fragment slot="actions">
        <Button icon="close" secondary edge on:click={close}>Anuluj</Button>
        {#if selected}
          <Button icon="delete" dangerous on:click={() => (selected = null)}>Wyczyść</Button>
        {/if}
      </svelte:fragment>
    </Library>
  </Modal>
{/if}
