<script>
  import { goto } from "$app/navigation";
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";

  import api from "$/api";
  import heimdall from "$/heimdall";

  import { read as fields } from "%/fields/directus_files";
  import Button from "@c/Button.svelte";
  import File from "@c/library/File.svelte";
  import Upload from "@c/library/Upload.svelte";
  import Pagination from "@c/Pagination.svelte";
  import Search from "@c/Search.svelte";

  const dispatch = createEventDispatcher();

  export let searchParams = null;
  export let limit = 25; // default for picker
  export let page = 1; // default for picker
  export let query = null;

  export let picker = false;
  export let selected = null;

  let files;
  let filesMeta;

  async function read(limit, page, query) {
    const res = await api.files.readByQuery({
      filter: query
        ? {
          _or: [
            { id: { _eq: query } },
            { filename_download: { _contains: query } },
            { title: { _contains: query } },
          ],
        }
        : {},
      fields,
      limit,
      page,
      sort: "-uploaded_on",
      meta: "*",
    });
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
      dispatch("select", file);
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
      goto(`/admin/biblioteka/${file.id}`, { noScroll: true });
    }
  }

  async function handleDelete() {
    const ids = files.filter((f) => f.marked).map((f) => f.id);
    if (ids.length) {
      if (confirm(`Czy na pewno chcesz usunąć ${ids.length} plików?`)) {
        await api.files.deleteMany(ids);
        heimdall.emit("directus_files", ids);
        // read(limit, page, query); <- not needed because of heimdall
      }
    }
  }

  $: read(limit, page, query);

  $: if (files) markSelected(selected);
  $: marked = files?.find((f) => f.marked);

  heimdall.listen(({ match }) => {
    if (match("directus_files")) read(limit, page, query);
  });
</script>

<div class="wrapper">
  <div class="actions">
    <Search {searchParams} bind:query />
  </div>

  {#if marked && !picker}
    <div class="buttons" transition:slide>
      <Button on:click={unmark}>Anuluj</Button>
      <Button on:click={handleDelete} dangerous>Usuń</Button>
    </div>
  {/if}

  <div class="content">
    {#if picker}
      <slot name="picker" />
    {/if}

    <div class="upload" class:picker>
      <Upload on:upload={() => read(limit, page)} />
    </div>

    {#if files?.length}
      {#each files as file (file.id)}
        {@const       data = (({ id, title, type, filesize, uploaded_on, modified_on, marked }) => {
        return { id, title, type, filesize, uploaded_on, modified_on, marked };
      })(file)}
        <File {...data} on:click={(e) => fileClick(e, file)} />
      {/each}
    {/if}
  </div>

  {#if files?.length === 0}
    <p class="empty">Cicho tu... zbyt cicho.</p>
  {/if}

  <Pagination {searchParams} bind:limit bind:page count={filesMeta?.filter_count} />
</div>

<style>
  .actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: var(--border-radius);
    border: var(--border-light);
    background-color: var(--light);
  }

  .upload {
    grid-column: start / end;
  }
  .upload.picker {
    grid-column: 2 / end;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
    border-radius: var(--border-radius);
    border: var(--border-light);
    margin-bottom: 1.5rem;
    padding: 0.5rem;
    background-color: var(--light);
  }
  .content {
    display: grid;
    grid-template-columns: [start] repeat(auto-fill, minmax(125px, 1fr)) [end];
    grid-template-rows: 200px repeat(auto-fill, auto);
    gap: 1rem;
  }
  .empty {
    text-align: center;
    margin: 2rem 0;
    font-size: 1.2rem;
  }
</style>
