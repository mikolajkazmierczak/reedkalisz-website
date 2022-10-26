<script>
  import { goto, afterNavigate } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { page } from '$app/stores';

  import api from '$lib/api';
  import socket from '$lib/admin/heimdall';
  import { getSearchParams, setSearchParams } from '$lib/utils';

  import { read as fields } from '$lib/fields/files';
  import Button from '$lib/admin/input/Button.svelte';

  import Filters from '$lib/admin/common/Filters.svelte';
  import Upload from '$lib/admin/library/Upload.svelte';
  import File from '$lib/admin/library/File.svelte';
  import Pagination from '$lib/admin/common/Pagination.svelte';

  const dispatch = createEventDispatcher();

  export let picker = false;
  export let selected = null;

  const rootPathname = '/admin/biblioteka';
  let selectedLimit = 25;
  let selectedPage = 1;
  let selectedQuery = null;
  afterNavigate(navigation => {
    const searchParams = getSearchParams(['p', 'q']); // page, query
    if (searchParams.p != null) selectedPage = searchParams.p;
    if (searchParams.q != null) selectedQuery = searchParams.q;
    setSearchParams({ p: selectedPage, s: selectedQuery }, navigation, rootPathname);
  });
  $: if (!picker) setSearchParams({ p: selectedPage, s: selectedQuery });

  let files;
  let filesMeta;

  let filterUse = null;
  let filterType = null;

  async function read(limit = 25, page = 1) {
    const res = await api.files.readByQuery({ fields, sort: '-uploaded_on', limit, page, meta: '*' });
    files = res.data;
    filesMeta = res.meta;
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
        read(selectedLimit, selectedPage);
      }
    }
  }

  $: read(selectedLimit, selectedPage);

  $: if (selected && files) markSelected(selected);
  $: marked = files?.find(f => f.marked);

  async function listener(data) {
    const { match } = socket.checkMatch(data, 'files');
    if (match) read(selectedLimit, selectedPage);
  }
  socket.onChanges(listener);
  onDestroy(() => socket.offChanges(listener));
</script>

<div class="actions" class:picker>
  <Filters
    title={'Użycie'}
    filters={[
      { label: 'Nieużywane', value: null },
      {
        label: 'Produkt',
        value: 'products',
        children: [
          { label: 'Magazyn', value: 'products.storage' },
          { label: 'Galeria', value: 'products.gallery' },
          { label: 'Opis', value: 'products.description' }
        ]
      },
      { label: 'Kategoria', value: 'categories' },
      { label: 'Strona', value: 'pages' },
      { label: 'Fragment', value: 'fragments' },
      { label: 'Menu', value: 'menus' }
    ]}
    bind:selected={filterUse}
  />
  <Filters
    title={'Rozszerzenie'}
    filters={[
      {
        label: 'Obraz',
        value: 'image',
        children: [
          { label: 'JPG', value: 'image/jpeg' },
          { label: 'PNG', value: 'image/png' },
          { label: 'WEBP', value: 'image/webp' },
          { label: 'SVG', value: 'image/svg+xml' }
        ]
      },
      { label: 'Inne', value: null, children: [{ label: 'PDF', value: 'application/pdf' }] }
    ]}
    bind:selected={filterType}
  />
</div>

{#if marked && !picker}
  <div class="buttons" transition:slide>
    <Button on:click={unmark}>Anuluj</Button>
    <Button on:click={handleDelete} dangerous>Usuń</Button>
  </div>
{/if}

<Upload on:upload={read} />

{#if files}
  <div class="files">
    {#each files as file (file.id)}
      <File {...file} on:click={e => fileClick(e, file)} />
    {/each}
  </div>
{/if}

<Pagination bind:limit={selectedLimit} bind:page={selectedPage} total={filesMeta?.filter_count} />

<style>
  .actions {
    z-index: 1;
    position: sticky;
    top: calc(4rem + 1.5rem);
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    padding: 0.5rem;
    width: 100%;
    background-color: var(--accent);
  }
  .actions.picker {
    top: 1rem;
  }

  .buttons {
    margin-bottom: 1rem;
  }
  .files {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }
</style>
