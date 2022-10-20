<script>
  import { goto } from '$app/navigation';
  import api, { baseUrl } from '$lib/api';
  import { filetypeToReadable, bytesToReadable } from '$lib/utils';

  import { edit as fields } from '$lib/fields/files';
  import Editor from '$lib/admin/editors/Editor.svelte';
  import Button from '$lib/admin/input/Button.svelte';
  import Blame from '$lib/admin/common/Blame.svelte';
  import Icon from '$lib/common/Icon.svelte';
  import Upload from '$lib/admin/library/Upload.svelte';

  export let id;

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

<Editor back="/admin/biblioteka" icon="library" title={id}>
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

        <div><b>Dodano:</b> <br /> <Blame user={file.uploaded_by} datetime={file.uploaded_on} /></div>
        {#if file.modified_by}
          <div><b>Zaktualizowano:</b> <br /> <Blame user={file.modified_by} datetime={file.modified_on} /></div>
        {/if}
        <br />

        {#if file.width}
          <div><b>Szerokość:</b> <br /> {file.width}</div>
          <div><b>Wysokość:</b> <br /> {file.height}</div>
          <br />
        {/if}
      </div>

      <div class="ui-section__col ui-box actions">
        <Button icon="delete" dangerous on:click={handleDelete}>Usuń</Button>
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
        <div class="icon">
          <Icon name="file" />
        </div>
      {/if}
    </div>
  {/if}
</Editor>

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
  .icon {
    display: block;
    max-width: 3rem;
    opacity: 0.5;
  }
</style>
