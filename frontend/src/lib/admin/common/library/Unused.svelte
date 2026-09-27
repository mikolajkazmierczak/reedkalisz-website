<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { ask } from '@/dialog';
  import { bytesToReadable } from '%/utils';
  import { plural } from '@/plural';
  import { scanFileReferences } from '@/files';
  import Loader from '$c/Loader.svelte';
  import Button from '@c/Button.svelte';
  import Modal from '@c/Modal.svelte';
  import Pagination from '@c/Pagination.svelte';
  import File, { fileProps } from '@c/library/File.svelte';

  // Files no collection refers to anywhere (tagged ones - avatars and other hidden files - aside), to delete in bulk.
  // Images are marked for deletion, other files (catalogues, price lists) not: they may be linked from outside the
  // site, e.g. in an email, where the database can't see it. Click a file to change it.

  const dispatch = createEventDispatcher();

  let unused = null;
  let kept = new Set();
  // the images a page at a time (others are few), the list back at its top on another page
  let limit = 100;
  let page = 1;
  let list;
  $: (page, list?.scrollTo({ top: 0 }));
  let deleting = null; // progress text

  onMount(async () => {
    const fields = [
      'id',
      'title',
      'type',
      'filesize',
      'width',
      'height',
      'uploaded_on',
      'modified_on',
      'tags',
      'company',
    ];
    const [files, refs] = await Promise.all([
      api.files.readByQuery({ fields, limit: -1, sort: '-uploaded_on' }).then((res) => res.data),
      scanFileReferences(),
    ]);
    unused = files.filter((f) => !refs.has(f.id) && !f.tags?.length);
    kept = new Set(unused.filter((f) => !isImage(f)).map((f) => f.id));
  });

  const isImage = (f) => f.type?.startsWith('image/');
  $: others = (unused ?? []).filter((f) => !isImage(f));
  $: images = (unused ?? []).filter(isImage);

  function toggle(id) {
    kept.has(id) ? kept.delete(id) : kept.add(id);
    kept = kept;
  }

  $: marked = (unused ?? []).filter((f) => !kept.has(f.id));
  const sizeOf = (files) => files.reduce((sum, f) => sum + (Number(f.filesize) || 0), 0);
  $: size = sizeOf(marked);

  async function remove() {
    const question = `Usunąć ${marked.length} nieużywanych plików (${bytesToReadable(size)})? Tego nie można cofnąć.`;
    if (!(await ask(question, { ok: 'Usuń', danger: true }))) return;
    const ids = marked.map((f) => f.id);
    // a failed batch still lets go of the popup; every id is reported, as a reread keeps those still there
    try {
      for (let i = 0; i < ids.length; i += 100) {
        deleting = `${i}/${ids.length}`;
        await api.files.deleteMany(ids.slice(i, i + 100));
      }
    } finally {
      heimdall.emit('directus_files', ids);
      dispatch('close');
    }
  }
</script>

<Modal type="fill" dotted on:close={() => !deleting && dispatch('close')}>
  <!-- the bar scrolls away with the files -->
  <div class="list" bind:this={list}>
    <div class="head ui-bar">
      {#if !unused}
        <p class="aligned"><Loader dark /> Szukam plików, których nic nie używa...</p>
      {:else}
        <div class="buttons">
          <Button icon="close" disabled={!!deleting} on:click={() => dispatch('close')}>Anuluj</Button>
          {#if unused.length}
            <Button dangerous icon="delete" disabled={!!deleting || !marked.length} on:click={remove}>
              {deleting ? `Usuwanie ${deleting}...` : 'Usuń'}
            </Button>
          {/if}
        </div>
        {#if unused.length}
          <div class="ui-counts">
            <span class="ui-stat-value">{marked.length}</span>
            <span class="ui-stat-label">Do usunięcia</span>
          </div>
          <span class="ui-divider" />
        {/if}
        <h3>
          Nieużywane pliki
          <small class="muted">
            · {unused.length
              ? `${plural(unused.length, 'plik', 'pliki', 'plików')}, ${bytesToReadable(sizeOf(unused))}`
              : 'wszystkie pliki są gdzieś używane'}
          </small>
        </h3>
      {/if}
    </div>
    {#if unused?.length}
      {#if others.length}
        <h4>Inne pliki ({others.length})</h4>
        <div class="ui-tiles">
          {#each others as file (file.id)}
            <File
              {...fileProps(file)}
              marked={!kept.has(file.id)}
              remove="Usuń"
              backing="var(--grey-100)"
              on:click={() => toggle(file.id)} />
          {/each}
        </div>
      {/if}
      {#if images.length}
        <h4>Zdjęcia ({images.length})</h4>
        <div class="ui-tiles">
          {#each images.slice((page - 1) * limit, page * limit) as file (file.id)}
            <File
              {...fileProps(file)}
              marked={!kept.has(file.id)}
              remove="Usuń"
              backing="var(--grey-100)"
              on:click={() => toggle(file.id)} />
          {/each}
        </div>
        <Pagination bind:limit bind:page count={images.length} />
      {/if}
    {/if}
  </div>
</Modal>

<style>
  /* a bar as the pages' (ui-bar): from the left, wrapping when there's no room */
  .head {
    flex: none;
    justify-content: flex-start;
    gap: 0.5rem 1rem;
    margin: 0 0 0.5rem;
  }
  .buttons {
    display: flex;
    gap: 0.5rem;
  }
  .list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  h3,
  h4,
  p {
    margin: 0;
  }
  h3 small {
    font-size: 0.85rem;
    font-weight: 400;
  }
  /* spaced as the picker's sections (see Library) */
  h4 {
    font-size: 1.15rem;
  }
  h4:not(:nth-child(2)) {
    margin-top: 0.75rem;
  }
  .aligned {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .muted {
    color: var(--grey-500);
  }
</style>
