<script>
  import { goto } from '$app/navigation';
  import api, { baseUrl } from '$/api';
  import heimdall from '$/heimdall';
  import { ask, tell } from '@/dialog';
  import { filetypeToReadable, bytesToReadable } from '%/utils';

  import { edit as fields } from '%/fields/directus_files';
  import Upload from '@c/library/Upload.svelte';
  import Editor from '@/editors/Editor.svelte';
  import Blame from '@c/Blame.svelte';
  import { companyOptions } from '@c/CompanySelect.svelte';
  import Icon from '$c/Icon.svelte';
  import Loader from '$c/Loader.svelte';
  import { describeReferences, findFileHistory, findFileReferences } from '@/files';
  import { portal } from '@/portal';
  import { unsaved } from '@/stores';
  import globals, { companies } from '@/globals';
  import Input from '@c/Input.svelte';

  export let id;

  let file;

  // whose it is: the images the api brought in are their company's; changed by hand for one added by hand, say
  let company = null;
  async function read() {
    const before = file;
    file = await api.files.readOne(id, { fields });
    imgError = false; // a replaced file gets its try
    if (!before || company === before.company) company = file.company; // not undoing an unsaved choice
  }
  $: options = [{ id: null, text: 'Brak', special: true }, ...companyOptions($companies)];
  $: $unsaved = !!file && company !== file.company;
  async function save() {
    await api.files.updateOne(id, { company });
    file.company = company;
    heimdall.emit('directus_files', id);
  }
  async function cancel() {
    company = file.company;
  }

  // where the file is used now, and which products used it before
  let usage = null; // { now: [{ text, href }], before: [{ text, href }] }
  async function readUsage(id) {
    usage = null;
    const [refs, history] = await Promise.all([findFileReferences([id]), findFileHistory(id)]);
    const now = await describeReferences(refs.get(id) ?? []);
    const current = new Set(now.map((u) => u.href));
    const before = history
      .map((p) => ({ text: `${p.code} ${p.name}`, href: `/admin/produkty/${p.slug}` }))
      .filter((u) => !current.has(u.href));
    usage = { now, before };
  }
  $: readUsage(id);

  async function handleDelete() {
    // a used file stays: its gallery rows would go with it, a variant's would stop the delete
    if (usage?.now.length) return tell('Ten plik jest gdzieś używany (zobacz „Używany w”). Najpierw usuń go stamtąd.');
    if (await ask('Usunąć ten plik? Tego nie można cofnąć.', { ok: 'Usuń', danger: true })) {
      await api.files.deleteOne(id);
      heimdall.emit('directus_files', id);
      $unsaved = false; // an unsaved Producent went with the file
      goto('/admin/biblioteka', { replaceState: true, noScroll: true });
    }
  }

  function getAssetsPathname(url) {
    // "/api" in production, "/" locally - without the end slash, or the link reads "//assets/..."
    return new URL(url).pathname.replace(/\/$/, '');
  }

  read();
  globals.update(companies);

  $: isImg = file?.type.startsWith('image/');
  $: src = file && `${baseUrl}/assets/${file.id}#${file.modified_on ?? file.uploaded_on}`;
  let imgError = false;

  // the lightbox takes the focus, and gives it back
  let zoomed = false;
  let opener = null;
  function zoom() {
    opener = document.activeElement;
    zoomed = true;
  }
  function unzoom() {
    zoomed = false;
    opener?.focus();
  }
  const focus = (node) => node.focus();
</script>

<svelte:window on:keydown={(e) => zoomed && e.key === 'Escape' && unzoom()} />

{#if zoomed}
  <button class="lightbox" type="button" aria-label="Zamknij powiększenie" use:portal use:focus on:click={unzoom}>
    <img {src} alt="" />
  </button>
{/if}

<Editor
  root="/admin/biblioteka"
  icon="library"
  title={file && (file.title || id)}
  collection="directus_files"
  removable={!!file}
  remove={handleDelete}
  {save}
  {cancel}>
  {#if file}
    <section class="ui-section">
      <div class="ui-section__row">
        <div class="ui-section__col">
          <div class="ui-box ui-box--uneditable">
            <h3 class="ui-h3">Link do pliku</h3>
            <a href="{baseUrl}/assets/{id}" target="_blank">
              <span class="assets-url">{getAssetsPathname(baseUrl)}/assets/</span>{id}
            </a>

            <h3 class="ui-h3">Właściwości</h3>
            <div>
              {filetypeToReadable(file.type)}
              {bytesToReadable(file.filesize)}
              {#if file.width}
                {file.width}x{file.height}
              {/if}
            </div>

            <h3 class="ui-h3">Pobierz</h3>
            <a href="{baseUrl}/assets/{id}?download" target="_blank">{file.filename_download}</a>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box swap">
            <h3 class="ui-h3">Podmień plik</h3>
            Linku do pliku się nie zmieni.
            <Upload update={id} on:upload={read} />
          </div>
          <div class="ui-box">
            <Input type="select" bind:value={company} {options}>Producent</Input>
          </div>
        </div>

        <div class="ui-section__col usage">
          <div class="ui-box ui-box--uneditable">
            <h3 class="ui-h3">Utworzenie</h3>
            <div><Blame user={file.uploaded_by} datetime={file.uploaded_on} /></div>
            {#if file.modified_by}
              <h3 class="ui-h3">Aktualizacja</h3>
              <div><Blame user={file.modified_by} datetime={file.modified_on} /></div>
            {/if}
          </div>
          <div class="ui-box ui-box--uneditable">
            <h3 class="ui-h3">Używany w</h3>
            {#if !usage}
              <p class="aligned"><Loader dark /> Szukam...</p>
            {:else if !usage.now.length}
              <p>Nigdzie - można go bezpiecznie usunąć.</p>
            {:else}
              <ul>
                {#each usage.now as { text, href }}
                  <li>
                    {#if href}<a {href}>{text}</a>{:else}{text}{/if}
                  </li>
                {/each}
              </ul>
            {/if}
            {#if usage?.before.length}
              <h3 class="ui-h3">Kiedyś używany w</h3>
              <ul>
                {#each usage.before as { text, href }}
                  <li><a {href}>{text}</a></li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>
      </div>
    </section>

    <div class="file">
      {#if isImg && imgError}
        <div class="error">Nie można wyświetlić obrazka</div>
      {:else if isImg}
        <button class="preview" type="button" aria-label="Powiększ" on:click={zoom}>
          <img {src} alt="" on:error={() => (imgError = true)} />
        </button>
      {:else}
        <div class="icon">
          <Icon fill name="file" />
        </div>
      {/if}
    </div>
  {/if}
</Editor>

<style>
  .usage ul {
    margin: 0;
    padding-left: 1.25rem;
  }
  .aligned {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .assets-url {
    font-size: 0.9rem;
  }

  .swap {
    gap: 0.5rem;
  }

  .file {
    margin-top: 1.5rem;
  }
  .preview {
    display: block;
    max-width: 100%;
    padding: 0;
    border: none;
    background: none;
    cursor: zoom-in;
  }
  .preview img {
    display: block;
    max-width: 100%; /* only shrinks */
    border-radius: var(--box-radius);
    corner-shape: squircle;
  }

  .lightbox {
    z-index: 1000; /* like a popup */
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 2rem;
    border: none;
    background-color: var(--black-50);
    cursor: zoom-out;
  }
  .lightbox img {
    max-width: 100%;
    max-height: calc(100vh - 4rem);
    object-fit: contain;
  }
  .icon {
    display: block;
    max-width: 3rem;
    opacity: 0.5;
  }
</style>
