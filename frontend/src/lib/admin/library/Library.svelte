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
  }

  function markSelected(id) {
    for (let f of files) {
      f.marked = f.id == id;
    }
    files = files;
  }

  function unmark() {
    for (let f of files) {
      f.marked = false;
    }
    files = files;
  }

  function fileClick(e, file) {
    if (picker) {
      selected = file.id;
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
        read();
      }
    }
  }

  read();

  $: if (selected && files) markSelected(selected);
  $: marked = files?.find(f => f.marked);

  async function listener(data) {}
  socket.onChanges(listener);
  onDestroy(() => socket.offChanges(listener));
</script>

<div class="actions" class:picker>
  {#if marked && !picker}
    <Button on:click={unmark}>Anuluj</Button>
    <Button on:click={handleDelete} dangerous>Usuń</Button>
  {/if}
  <div class="filters">
    <img src="/icons/dark/filters.svg" alt="filters" title="Filtrowanie" />
    <div
      on:click={e => {
        console.log(e.target.classList);
        e.target.classList.toggle('active');
      }}
    >
      Nieużywane
    </div>
    <div>Produkt</div>
    <div>Kategoria</div>
    <div>Strona</div>
    <div>Fragment</div>
    <div>Menu</div>
  </div>
</div>

<Upload on:upload={read} />

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
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    padding: 0.5rem;
    width: 100%;
    height: 3rem;
    background-color: var(--accent);
  }
  .actions.picker {
    top: 1rem;
  }
  .actions img {
    max-height: 100%;
  }

  .filters {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 0.5rem;
  }
  .filters img {
    height: 1.5rem;
  }
  .filters div {
    cursor: pointer;
    user-select: none;
    display: grid;
    place-items: center;
    border: var(--border);
    border-radius: 2rem;
    height: 1.75rem;
    padding: 0 0.75rem;
    transition: background-color 200ms, color 200ms;
  }
  .filters div:hover {
    background-color: var(--primary-white);
  }
  :global(.filters div.active) {
    background-color: var(--primary) !important;
    color: var(--primary-text);
  }

  .files {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }
</style>
