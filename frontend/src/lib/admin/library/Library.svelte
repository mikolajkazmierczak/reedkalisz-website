<script>
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import api from '$lib/api';
  import socket from '$lib/admin/heimdall';

  import { read as fields } from '$lib/fields/files';
  import Button from '$lib/admin/input/Button.svelte';

  import Upload from '$lib/admin/library/Upload.svelte';
  import File from '$lib/admin/library/File.svelte';

  const dispatch = createEventDispatcher();

  export let picker = false;
  export let selected = null;

  let files;

  async function read() {
    files = (await api.files.readByQuery({ fields, sort: '-uploaded_on', limit: 50 })).data;
    if (selected) {
      let f = files.find(f => f.id == selected);
      if (f) f.marked = true;
    }
  }

  function fileClick(e, file) {
    if (picker) {
      dispatch('select', file);
    } else if (e.ctrlKey || e.shiftKey || marked) {
      if (e.shiftKey) {
        const start = files.indexOf(marked);
        const end = files.indexOf(file);
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        files.forEach((f, i) => {
          f.marked = i >= min && i <= max;
        });
      } else {
        file.marked = !file.marked;
      }
      files = files;
    } else {
      goto(`/admin/biblioteka/${file.id}`);
    }
  }

  async function handleDelete() {
    const ids = files.filter(f => f.marked).map(f => f.id);
    if (ids.length) {
      if (confirm(`Czy na pewno chcesz usunąć ${ids.length} plików?`)) {
        await api.files.deleteMany(ids);
      }
    }
    read();
  }

  read();

  $: marked = files?.find(f => f.marked);

  async function listener(data) {}
  socket.onChanges(listener);
  onDestroy(() => socket.offChanges(listener));
</script>

{#if marked}
  <div class="actions" class:picker>
    <Button on:click={handleDelete}>Usuń zaznaczone</Button>
  </div>
{/if}

<Upload on:uploaded={read} />
{#if files}
  <div class="files">
    {#each files as file (file.id)}
      <File {...file} on:click={e => fileClick(e, file)} />
    {/each}
  </div>
{/if}

<style>
  .actions {
    z-index: 1;
    position: sticky;
    top: calc(4rem + 1.5rem);
    left: 0;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    padding: 0.5rem;
    width: 100%;
    background-color: var(--accent);
  }
  .actions.picker {
    top: 1rem;
  }

  .files {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }
</style>
