<script>
  import { marked } from 'marked';

  import api from '$/api';
  import { edit as fields, defaults } from '%/fields/commercial_details';
  import { deep, diff } from '%/utils';

  import { unsaved } from '@/stores';
  import Editor from '@/editors/Editor.svelte';
  import Blames from '@/editors/Blames.svelte';
  import Input from '@c/Input.svelte';

  export let id;

  let item;
  let itemOriginal;

  async function read() {
    if (id == '+') {
      item = defaults();
    } else {
      item = await api.items('commercial_details').readOne(id, { fields });
    }
    itemOriginal = item ? deep.copy(item) : null;
  }

  read();

  $: diff(item, itemOriginal, { editorPreset: true }).then(({ changed }) => {
    $unsaved = changed;
  });
</script>

<Editor
  root="/admin/paragrafy"
  icon="commercial_details"
  title={item?.name}
  collection="commercial_details"
  removable={!!itemOriginal?.date_created}
  bind:item
  bind:itemOriginal>
  {#if item}
    <section class="ui-section">
      <div class="ui-section__row">
        <div class="ui-section__col">
          <div class="ui-box">
            <h3 class="ui-h3">Nazwa</h3>
            <Input bind:value={item.name} />
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box ui-box--uneditable">
            <Blames {item} />
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
                placeholder="Przed Tobą stoi puste płótno, zapełnij je czymś niezwykłym..." />
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
  {/if}
</Editor>
