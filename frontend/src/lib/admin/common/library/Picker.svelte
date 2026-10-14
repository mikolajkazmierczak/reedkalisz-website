<script>
  import api, { baseUrl } from '$/api';
  import Icon from '$c/Icon.svelte';
  import { bytesToReadable } from '%/utils';
  import { read as fields } from '%/fields/directus_files';

  import Button from '@c/Button.svelte';
  import File, { fileProps } from '@c/library/File.svelte';
  import Library from '@c/library/Library.svelte';
  import Modal from '@c/Modal.svelte';

  let opened;

  export let selected;
  export let fileContext = null; // in a product: { used, history } file ids, shown first
  // 'tile': the file as the library shows it (a product's pictures); 'button': a field's row, its picture small on the
  // left and its name and size beside it (the homepage editor's banner)
  export let look = 'tile';
  export let empty = 'Wybierz plik'; // the button's text while there's none
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

{#if look === 'button'}
  <button class="pick" type="button" on:click={open}>
    <span class="pick__thumb">
      {#if selected}
        <img src="{baseUrl}/assets/{selected}?key=thumb" alt="" />
      {:else}
        <Icon name="image_add" width="55%" dark />
      {/if}
    </span>
    <span class="pick__text">
      <span class="pick__name">{selected ? (fileData?.title ?? fileData?.filename_download ?? '…') : empty}</span>
      {#if selected && fileData}
        <span class="pick__meta"
          >{[
            fileData.width && `${fileData.width} × ${fileData.height}`,
            fileData.filesize && bytesToReadable(fileData.filesize),
          ]
            .filter(Boolean)
            .join(' · ')}</span>
      {/if}
    </span>
    <Icon name="chevron_right" width="1rem" dark />
  </button>
{:else}
  <File {...fileData} marked={false} on:click={open} />
{/if}

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

<style>
  /* a field's row: its picture on the left, small, on the light check of a transparent one; its name beside it */
  .pick {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--half);
    width: 100%;
    padding: var(--quarter);
    padding-right: var(--half);
    border: 1px solid var(--edge);
    border-bottom-color: var(--edge-line);
    border-radius: var(--field-radius);
    corner-shape: squircle;
    background-color: var(--paper-field);
    text-align: left;
    transition: border-color 100ms;
  }
  .pick:hover,
  .pick:focus-visible {
    border-color: var(--navy-500);
  }
  .pick__thumb {
    flex: none;
    display: grid;
    place-items: center;
    width: calc(2 * var(--cell));
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: var(--border-radius);
    corner-shape: squircle;
    background: repeating-conic-gradient(var(--grey-100) 0 25%, var(--paper-field) 0 50%) 50% / 0.75rem 0.75rem;
  }
  .pick__thumb img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .pick__text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }
  .pick__name {
    overflow: hidden;
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .pick__meta {
    color: var(--ink-muted);
    font-size: 0.75rem;
  }
</style>
