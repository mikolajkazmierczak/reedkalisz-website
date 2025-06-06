<script>
  import { marked } from 'marked';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { edit as fields } from '%/fields/fragments';
  import { deep, diff } from '%/utils';

  import { unsaved } from '@/stores';
  import { users } from '@/globals';
  import Editor from '@/editors/Editor.svelte';
  import Input from '@c/Input.svelte';
  import Blame from '@c/Blame.svelte';

  export let id;

  let item;
  let itemOriginal;

  async function save(action) {
    await action();
    data = JSON.stringify(item.data, null, 2);
  }

  let data;

  let dataParsingError = false;
  async function parseData(data) {
    try {
      if (data === '') data = null; // empty field is also a valid value
      item.data = JSON.parse(data);
      dataParsingError = null;
    } catch (e) {
      dataParsingError = e.message;
    }
  }

  async function read() {
    item = await api.items('fragments').readOne(id, { fields });
    itemOriginal = item ? deep.copy(item) : null;
    data = JSON.stringify(item.data, null, 2);
  }

  read();

  $: parseData(data);

  $: diff(item, itemOriginal, { editorPreset: true }).then(({ changed }) => {
    $unsaved = !dataParsingError && changed;
  });

  heimdall.listen(({ match, me }) => {
    if (match('fragments', id) && !me) {
      alert('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.');
    }
  });
</script>

<Editor
  root="/admin/fragmenty"
  icon="fragments"
  title={item?.name}
  collection="fragments"
  bind:item
  bind:itemOriginal
  {save}
>
  {#if item}
    <section class="ui-section">
      <div class="ui-section__row">
        {#if item.description}
          <div class="ui-section__col" style:grid-column={'1 / span 2'}>
            <div class="ui-box ui-box--uneditable">
              <div>{@html marked.parse(item.description)}</div>
            </div>
          </div>
        {/if}
        <div class="ui-section__col" style:grid-column={item.description ? '3 / span 1' : '1 / span 1'}>
          <div class="ui-box ui-box--uneditable">
            <h3 class="ui-h3">Aktualizacja</h3>
            <p>
              {#if $users && item.date_updated}
                <Blame user={item.user_updated} datetime={item.date_updated} />
              {:else}
                Nie aktualizowano
              {/if}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="ui-section">
      <h2 class="ui-h2">Zawartość</h2>
      <div class="ui-section__row">
        <div class="ui-section__col ui-box" style:grid-column={'1 / span 4'}>
          <div class="ui-pair ui-texteditor">
            <div class="ui-texteditor__draft">
              <Input
                type="textarea"
                bind:value={item.content}
                rows={15}
                placeholder="Przed Tobą stoi puste płótno, zapełnij je czymś niezwykłym..."
              />
            </div>
            <div class="ui-texteditor__render">
              {#if item.content}
                {@html marked.parse(item.content)}
              {/if}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="ui-section">
      <h2 class="ui-h2">Dane <small>JSON</small></h2>
      <div class="ui-section__row">
        <div class="ui-section__col ui-box" style:grid-column={'1 / span 4'}>
          <div
            class="ui-pair ui-texteditor"
            style:background-color={dataParsingError ? 'var(--main-0)' : 'var(--light)'}
            style:padding-bottom={dataParsingError ? '0.5rem' : 0}
          >
            <div class="ui-texteditor__draft code">
              <Input
                type="textarea"
                format="json"
                bind:value={data}
                rows={30}
                error={dataParsingError ? `<b>SYNTAX ERROR</b>&nbsp; ${dataParsingError}` : false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  {/if}
</Editor>

<style>
  :global(pre) {
    margin: 0;
  }
  :global(code, code *) {
    font-family: monospace;
    font-size: 0.9rem;
  }
  .code {
    grid-column: 1 / span 4;
  }
  h2 small {
    font-size: 0.5em;
  }
</style>
