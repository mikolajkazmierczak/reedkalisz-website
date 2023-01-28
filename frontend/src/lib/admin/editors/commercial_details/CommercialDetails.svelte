<script>
  import { marked } from 'marked';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { edit as fields, defaults } from '%/fields/commercial_details';
  import { deep, diff } from '%/utils';

  import editing from '@/editors/editing';
  import { unsaved } from '@/stores';
  import { users } from '@/globals';
  import Editor from '@/editors/Editor.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Blame from '@c/Blame.svelte';

  export let id;

  let item;
  let itemOriginal;

  function remove() {
    editing.remove('commercial_details', id, { root: '/admin/informacje-handlowe' });
  }

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

  heimdall.listen(({ match, me }) => {
    if (match('commercial_details', id) && !me) {
      alert('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.');
    }
  });
</script>

<Editor
  root="/admin/informacje-handlowe"
  icon="commercial_details"
  title={item?.name}
  collection="commercial_details"
  bind:item
  bind:itemOriginal
>
  {#if item}
    <section class="ui-section">
      <div class="ui-section__row">
        <div class="ui-section__col">
          <div class="ui-box">
            <Input bind:value={item.name}>Nazwa</Input>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box">
            <Button icon="delete" on:click={remove} dangerous>Usuń</Button>
          </div>

          <div class="ui-box ui-box--uneditable">
            <h3 class="ui-h3">Utworzenie</h3>
            <p>
              {#if $users && item.date_created}
                <Blame user={item.user_created} datetime={item.date_created} />
              {:else}
                Tu będziesz ty
              {/if}
            </p>
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
  {/if}
</Editor>
