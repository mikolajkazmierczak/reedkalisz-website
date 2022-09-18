<script>
  import { goto } from '$app/navigation';
  import api, { baseUrl } from '$lib/api';
  import { filetypeToReadable, bytesToReadable } from '$lib/utils';

  import { edit as fields } from '$lib/fields/files';
  import { page, edited } from '$lib/admin/stores';
  import Button from '$lib/admin/input/Button.svelte';
  import Blame from '$lib/admin/common/Blame.svelte';

  import Upload from '$lib/admin/library/Upload.svelte';

  $: $page = {
    title: file?.title,
    path: [{ href: '/biblioteka', name: 'Biblioteka plików' }]
  };
  $: $edited = false;

  export let data;
  let { id } = data;

  let file;

  async function read() {
    isImg = false; // needed to reset the img preview
    file = await api.files.readOne(id, { fields });
  }

  async function handleDelete() {
    if (confirm('Napewno?')) {
      await api.files.deleteOne(id);
      goto('/admin/biblioteka', { replace: true });
    }
  }

  read();

  $: isImg = file?.type.startsWith('image/');
  $: imgError = false;
</script>

{#if file}
  <section class="ui-section__row">
    <div class="ui-section__col ui-box ui-box--uneditable">
      <div>
        <b>ID:</b> <a href={`${baseUrl}/assets/${id}`} target="_blank">{id}</a>
      </div>
      <div>
        <b>Plik:</b>
        {filetypeToReadable(file.type)}
        {bytesToReadable(file.filesize)}
      </div>
      <br />

      <div>
        <b>Nazwa na dysku:</b> <br />
        {file.filename_disk}
      </div>
      <div>
        <b>Nazwa przy pobraniu:</b> <br />
        <a href={`${baseUrl}/assets/${id}?download`}>{file.filename_download}</a> <br />
      </div>
      <br />

      <div><b>Dodano:</b> <br /> <Blame user={file.uploaded_by} time={file.uploaded_on} /></div>
      {#if file.modified_by}
        <div><b>Zaktualizowano:</b> <br /> <Blame user={file.modified_by} time={file.modified_on} /></div>
      {/if}
      <br />

      {#if file.width}
        <div><b>Szerokość:</b> <br /> {file.width}</div>
        <div><b>Wysokość:</b> <br /> {file.height}</div>
        <br />
      {/if}
    </div>

    <div class="ui-section__col ui-box actions">
      <Button icon="delete.svg" dangerous on:click={handleDelete}>Usuń</Button>
      <br /><br />
      <div>
        <b>Zamień plik:</b> <br />
        <Upload update={id} on:upload={read} />
      </div>
    </div>
  </section>

  <div class="file">
    {#if isImg}
      <img src={`${baseUrl}/assets/${file.id}`} alt="" on:error={() => (imgError = true)} />
      {#if imgError}
        <div class="error">Nie można wyświetlić obrazka</div>
      {/if}
    {:else}
      <img src={`/icons/dark/file.svg`} alt="" />
    {/if}
  </div>
{/if}

<style>
  .ui-box {
    display: block;
  }
  .actions {
    grid-column: 2 / 4;
  }

  .file {
    margin-top: 1.5rem;
  }
  img {
    display: block;
    max-width: 100%;
  }
</style>
