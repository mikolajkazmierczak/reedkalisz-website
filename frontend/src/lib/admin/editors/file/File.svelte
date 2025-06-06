<script>
  import { goto } from '$app/navigation';
  import api, { baseUrl } from '$/api';
  import heimdall from '$/heimdall';
  import { filetypeToReadable, bytesToReadable } from '%/utils';

  import { edit as fields } from '%/fields/directus_files';
  import Upload from '@c/library/Upload.svelte';
  import Editor from '@/editors/Editor.svelte';
  import Button from '@c/Button.svelte';
  import Blame from '@c/Blame.svelte';
  import Icon from '$c/Icon.svelte';

  export let id;

  let file;
  $: uploaded_on = file?.uploaded_on;
  $: modified_on = file?.modified_on;

  async function read() {
    file = await api.files.readOne(id, { fields });
  }

  async function handleDelete() {
    if (confirm('Na :) pewno?')) {
      await api.files.deleteOne(id);
      heimdall.emit('directus_files', id);
      goto('/admin/biblioteka', { replaceState: true, noScroll: true });
    }
  }

  function getAssetsPathname(url) {
    return new URL(url).pathname;
  }

  read();

  $: isImg = file?.type.startsWith('image/');
  $: imgError = false;
</script>

<Editor root="/admin/biblioteka" icon="library" title={id}>
  {#if file}
    <section class="ui-section">
      <div class="ui-section__row">
        <div class="ui-section__col info">
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

        <div class="ui-section__col blame">
          <div class="ui-box swap">
            <h3 class="ui-h3">Podmień plik</h3>
            Linku do pliku się nie zmieni.
            <Upload update={id} on:upload={read} />
          </div>
        </div>

        <div class="ui-section__col actions">
          <div class="ui-box">
            <Button icon="delete" dangerous on:click={handleDelete}>Usuń</Button>
          </div>
          <div class="ui-box ui-box--uneditable">
            <h3 class="ui-h3">Utworzenie</h3>
            <div><Blame user={file.uploaded_by} datetime={file.uploaded_on} /></div>
            {#if file.modified_by}
              <h3 class="ui-h3">Aktualizacja</h3>
              <div><Blame user={file.modified_by} datetime={file.modified_on} /></div>
            {/if}
          </div>
        </div>
      </div>
    </section>

    <div class="file">
      {#if isImg}
        <img
          src="{baseUrl}/assets/{file.id}#{modified_on ? modified_on : uploaded_on}"
          alt=""
          on:error={() => (imgError = true)}
        />
        {#if imgError}
          <div class="error">Nie można wyświetlić obrazka</div>
        {/if}
      {:else}
        <div class="icon">
          <Icon fill name="file" />
        </div>
      {/if}
    </div>
  {/if}
</Editor>

<style>
  .info {
    grid-column: 1 / 2;
  }
  .assets-url {
    font-size: 0.9rem;
  }

  .actions {
    grid-column: 3 / 4;
  }
  .swap {
    gap: 0.5rem;
  }

  .file {
    margin-top: 1.5rem;
  }
  .icon {
    display: block;
    max-width: 3rem;
    opacity: 0.5;
  }
</style>
