<script>
  import { createEventDispatcher } from 'svelte';
  import api from '$/api';
  import heimdall from '$/heimdall';
  import Button from '@c/Button.svelte';

  // Adds files (or replaces the `update` one): picked with the button, dropped on it, or given to `upload(files)`.
  const dispatch = createEventDispatcher();

  export let update = null; // id of the file to replace
  export let company = null; // the added files' company: the list's Producent, or they wouldn't show up in it

  let input;
  let uploading = false;

  export async function upload(files) {
    if (!files?.length || uploading) return;
    uploading = true;
    try {
      const form = new FormData();
      for (const file of update ? [files[0]] : files) {
        // before each file: Directus forgets the fields after every one
        if (company && !update) form.append('company', company);
        form.append('file', file);
      }
      let ids = update;
      if (update) await api.files.updateOne(update, form);
      else ids = [(await api.files.createMany(form)).data].flat().map((f) => f.id); // one file comes back alone
      heimdall.emit('directus_files', ids);
      dispatch('upload');
    } finally {
      uploading = false;
      if (input) input.value = ''; // the same file can be picked again (unless it's gone, closed mid-upload)
    }
  }
</script>

<div role="presentation" on:dragover|preventDefault on:drop|preventDefault={(e) => upload(e.dataTransfer.files)}>
  <Button dashed icon={update ? 'upload' : 'add'} disabled={uploading} on:click={() => input.click()}>
    {#if uploading}Przesyłanie...{:else if update}Przeciągnij lub podmień{:else}Przeciągnij lub dodaj{/if}
  </Button>
  <input type="file" hidden multiple={!update} bind:this={input} on:change={() => upload(input.files)} />
</div>
