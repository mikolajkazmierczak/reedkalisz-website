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
  let file;
  let fileData; // just what File shows

  // taking the file off happens at once (nothing to cancel: the picker just goes back, "Wróć"), so it can be brought
  // back while the picker is open: the one taken off stays marked, dashed and faded (see File)
  let cleared = null;
  // the product's files as they were when it opened: the one taken off stays in its group (not moved on as the
  // product changes under it)
  let context = null;

  function open() {
    cleared = null;
    context = fileContext;
    opened = true;
  }

  function close() {
    opened = false;
  }

  function clear() {
    cleared = selected;
    selected = null;
  }

  function restore() {
    selected = cleared;
    cleared = null;
  }

  function handleSelect(e) {
    file = e.detail;
    fileData = fileProps(file);
    selected = file.id;
    close();
  }

  // the file kept when it's taken off: brought back (or just picked in the library) it isn't read again
  async function read(id) {
    if (!id) return (fileData = null);
    if (file?.id !== id) {
      const found = await api.files.readOne(id, { fields });
      if (id !== selected) return; // taken off or another picked while it was read
      file = found;
    }
    fileData = fileProps(file);
  }

  $: read(selected);
</script>

<File {...fileData} marked={false} on:click={open} />

{#if opened}
  <!-- the library's own bar on top, not the frosted one -->
  <Modal type="fill" mat closeText={null} on:close={close}>
    <Library picker fileContext={context} bind:selected {cleared} on:select={handleSelect}>
      <svelte:fragment slot="actions">
        <Button icon="arrow_left" secondary edge on:click={close}>Wróć</Button>
        {#if selected}
          <Button icon="delete" dangerous on:click={clear}>Wyczyść</Button>
        {:else if cleared}
          <Button icon="arrow_counterclockwise" on:click={restore}>Przywróć</Button>
        {/if}
      </svelte:fragment>
    </Library>
  </Modal>
{/if}
