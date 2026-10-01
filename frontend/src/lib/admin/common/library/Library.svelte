<script>
  import { goto } from '$app/navigation';
  import { createEventDispatcher } from 'svelte';
  import { fade, slide } from 'svelte/transition';

  import heimdall from '$/heimdall';
  import { ask, tell } from '@/dialog';
  import { portal } from '@/portal';
  import Icon from '$c/Icon.svelte';

  import { read as fields } from '%/fields/directus_files';
  import Button from '@c/Button.svelte';
  import CompanySelect, { NONE } from '@c/CompanySelect.svelte';
  import File, { fileProps } from '@c/library/File.svelte';
  import Unused from '@c/library/Unused.svelte';
  import Upload from '@c/library/Upload.svelte';
  import Pagination from '@c/Pagination.svelte';
  import Search from '@c/Search.svelte';
  import { removeUnusedFiles, searchFiles } from '@/files';

  const dispatch = createEventDispatcher();

  export let searchParams = null;
  export let limit = 25; // default for picker
  export let page = 1; // default for picker
  export let query = null;

  export let picker = false;
  export let selected = null;
  export let dropping = true; // takes files dropped anywhere on the page
  // picker in a product: { used, history } - its files now and its files before.
  // They are offered first, each file only once, every section with its own pages.
  // Only ids are gathered up front, the files themselves are read a page at a time.
  export let fileContext = null;
  const SECTION_LIMIT = 12;

  let showUnused = false;
  let sections = null; // [{ heading, ids, page, files, count }]
  let excluded = []; // ids offered in the sections, left out of the rest

  // tagged files are hidden from the library
  const notHidden = { tags: { _null: true } };

  let lastContext = null;
  async function readContext(context) {
    // the product changes while the picker is open (e.g. when a file is picked), its files don't
    const key = JSON.stringify(context);
    if (key === lastContext) return;
    lastContext = key;
    if (!context) {
      sections = null;
      excluded = [];
      return;
    }
    const { used, history } = context;
    const seen = new Set();
    const take = (ids) => ids.filter((id) => id && !seen.has(id) && seen.add(id));
    const lists = [
      ['W tym produkcie', take(used)],
      ['Kiedyś w tym produkcie', take(history)],
    ];
    excluded = [...seen];
    sections = lists.map(([heading, ids]) => ({ heading, ids, page: 1, files: [], count: 0 }));
    await Promise.all(sections.map((_, i) => readSection(i, 1)));
  }
  $: picker && readContext(fileContext);

  async function readSection(i, page) {
    const section = sections[i];
    if (!section.ids.length) return;
    const { data, meta } = await searchFiles({
      filter: { _and: [{ id: { _in: section.ids } }, notHidden] },
      fields,
      limit: SECTION_LIMIT,
      page,
      sort: '-uploaded_on',
      meta: 'filter_count',
    });
    sections[i] = { ...section, page, files: data, count: meta.filter_count };
  }
  const pages = (section) => Math.max(1, Math.ceil(section.count / SECTION_LIMIT));

  let files;
  let filesMeta;

  // whose files: a company's (the images the api brought in, a product's), or none's (catalogues, hand uploads)
  let company = '';
  let lastCompany = '';
  $: if (company !== lastCompany) {
    lastCompany = company;
    if (searchParams) setTimeout(() => searchParams.set({ p: 1 }));
    else page = 1;
  }

  let request = 0; // only the latest read is shown (a company change reads twice: its page, then the first)
  async function read(limit, page, query, excluded, company) {
    const search = {
      _or: [
        { id: { _eq: query } },
        { filename_download: { _contains: query } },
        { title: { _contains: query } },
        { company: { name: { _contains: query } } },
      ],
    };
    const whose = company === NONE ? { company: { _null: true } } : company ? { company: { _eq: company } } : null;
    // in a product's picker the files offered above aren't repeated (there can be thousands, hence SEARCH)
    const notOffered = excluded.length ? [{ id: { _nin: excluded } }] : [];
    const n = ++request;
    const res = await searchFiles({
      filter: { _and: [...(query ? [search] : []), ...(whose ? [whose] : []), notHidden, ...notOffered] },
      fields,
      limit,
      page,
      sort: '-uploaded_on',
      meta: '*',
    });
    if (n !== request) return;
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
      goto(`/admin/biblioteka/${file.id}`, { noScroll: true });
    }
  }

  async function handleDelete() {
    const ids = files.filter((f) => f.marked).map((f) => f.id);
    if (ids.length) {
      if (await ask(`Usunąć ${ids.length} plików? Tego nie można cofnąć.`, { ok: 'Usuń', danger: true })) {
        // only the unused ones: a gallery's row would go with its file, a variant's would stop the whole delete
        const deleted = await removeUnusedFiles(ids);
        if (deleted.length) heimdall.emit('directus_files', deleted);
        const skipped = ids.length - deleted.length;
        if (skipped) tell(`Pominięto pliki, które są gdzieś używane: ${skipped}. Otwórz plik, żeby zobaczyć gdzie.`);
      }
    }
  }

  $: read(limit, page, query, excluded, company);

  // in the picker a file is marked for being the one picked; in the library, by the admin (ctrl, shift) for deleting
  $: if (files && picker) markSelected(selected);
  $: marked = files?.find((f) => f.marked);

  heimdall.listen(({ match }) => {
    if (match('directus_files')) read(limit, page, query, excluded, company);
  });

  let uploader;
  let dragged = 0; // enters minus leaves: every element the pointer passes sends both
  function drag(e) {
    if (!e.dataTransfer?.types.includes('Files')) return;
    // dragover, drop: not the browser's (it would open the file), even when not taken here
    if (e.type === 'dragover' || e.type === 'drop') e.preventDefault();
    if (!dropping) return;
    if (e.type === 'dragenter') return dragged++;
    if (e.type === 'dragleave') return (dragged = Math.max(0, dragged - 1));
    if (e.type === 'drop') {
      dragged = 0;
      uploader.upload(e.dataTransfer.files);
    }
  }
</script>

<svelte:window on:dragenter={drag} on:dragleave={drag} on:dragover={drag} on:drop={drag} />

{#if dragged}
  <div class="drop" use:portal transition:fade={{ duration: 100 }}>
    <Icon name="upload" height="4rem" light />
    Upuść plik, aby dodać
  </div>
{/if}

<div class="wrapper">
  <div class="actions ui-bar">
    <div class="left">
      <slot name="actions" />
      <Upload bind:this={uploader} company={company && company !== NONE ? company : null} />
      <CompanySelect bind:value={company} none />
    </div>
    <div class="right">
      {#if !picker}
        <Button size="sm" dangerous icon="delete" on:click={() => (showUnused = true)}>Posprzątaj</Button>
      {/if}
      <Search {searchParams} bind:query />
    </div>
  </div>

  {#if showUnused}
    <Unused on:close={() => (showUnused = false)} />
  {/if}

  {#if marked && !picker}
    <div class="buttons" transition:slide>
      <Button on:click={unmark}>Anuluj</Button>
      <Button on:click={handleDelete} dangerous>Usuń</Button>
    </div>
  {/if}

  {#if picker && sections}
    {#each sections as section, i}
      {#if section.ids.length}
        <div class="section-head">
          <h3 class="ui-h3 heading">{section.heading} <small>({section.count})</small></h3>
          {#if pages(section) > 1}
            <div class="pager">
              <Button
                size="sm"
                square
                icon="chevron_left"
                title="Poprzednia strona"
                disabled={section.page <= 1}
                on:click={() => readSection(i, section.page - 1)} />
              <small>{section.page} / {pages(section)}</small>
              <Button
                size="sm"
                square
                icon="chevron_right"
                title="Następna strona"
                disabled={section.page >= pages(section)}
                on:click={() => readSection(i, section.page + 1)} />
            </div>
          {/if}
        </div>
        <div class="context ui-tiles">
          {#each section.files as file (file.id)}
            <File
              {...fileProps(file)}
              marked={file.id === selected}
              backing="var(--grey-100)"
              on:click={(e) => fileClick(e, file)} />
          {/each}
        </div>
      {/if}
    {/each}
    <h3 class="ui-h3 heading">Pozostałe pliki</h3>
  {/if}

  <div class="ui-tiles">
    {#if files?.length}
      {#each files as file (file.id)}
        <File
          {...fileProps(file)}
          marked={file.marked}
          backing="var(--grey-100)"
          on:click={(e) => fileClick(e, file)} />
      {/each}
    {/if}
  </div>

  {#if files?.length === 0}
    <p class="empty">Cicho tu... zbyt cicho.</p>
  {/if}

  <Pagination {searchParams} bind:limit bind:page count={filesMeta?.filter_count} />
</div>

<style>
  .heading {
    margin: 0 0 0.75rem;
  }
  .context {
    margin-bottom: 1.5rem;
  }
  .section-head {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }
  .section-head .heading {
    margin: 0;
  }
  .pager {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .left,
  .right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .left {
    margin-right: auto;
  }

  /* under the dialogs (1500) only */
  .drop {
    pointer-events: none;
    z-index: 1400;
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    border: dashed 0.1875rem var(--light);
    background-color: var(--black-50);
    color: var(--light);
    font-size: 2rem;
    font-weight: 600;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
    border-radius: var(--box-radius);
    corner-shape: squircle;
    border: var(--border-light);
    margin-bottom: 1.5rem;
    padding: 0.5rem;
    background-color: var(--light);
  }
  .empty {
    text-align: center;
    margin: 2rem 0;
    font-size: 1.2rem;
  }
</style>
