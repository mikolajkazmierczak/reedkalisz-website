<script>
  import { marked } from 'marked';

  import api from '$/api';
  import { edit as fields, defaults } from '%/fields/pages';
  import { deep, slugify, diff } from '%/utils';

  import { unsaved } from '@/stores';
  import Editor from '@/editors/Editor.svelte';
  import Blames from '@/editors/Blames.svelte';
  import Input from '@c/Input.svelte';

  export let slug;

  let item;
  let itemOriginal;

  async function read() {
    if (slug == '+') {
      item = defaults();
    } else {
      const filter = { slug: { _eq: slug } };
      item = (await api.items('pages').readByQuery({ fields, filter })).data[0];
    }
    itemOriginal = item ? deep.copy(item) : null;
  }

  read();

  $: if (item)
    item.slug = slugify(item?.name, {
      key: true,
      partsOriginal: itemOriginal?.name,
      slugOriginal: itemOriginal?.slug,
    });

  $: correctSlug = item && !['+', ''].includes(item.slug);
  $: diff(item, itemOriginal, { editorPreset: true }).then(({ changed }) => {
    unsaved.set(correctSlug && changed);
  });
</script>

<Editor
  root="/admin/strony"
  icon="pages"
  title={item?.name}
  collection="pages"
  removable={!!itemOriginal?.date_created}
  bind:item
  bind:itemOriginal>
  {#if item}
    <section class="ui-section">
      <div class="ui-section__row">
        <div class="ui-section__col">
          <div class="ui-box">
            <h3 class="ui-h3">Tytuł</h3>
            <Input bind:value={item.name} />
          </div>
          <div class="ui-box">
            <div class="ui-pair">
              <Input type="checkbox" bind:value={item.enabled}>Widoczna</Input>
            </div>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box ui-box--uneditable">
            <h3 class="ui-h3">Link do strony</h3>
            {#if item.date_created}
              <a href="/{item.slug}" rel="noreferrer" target="_blank">/{item.slug}</a>
            {:else}
              /{item.slug || '...'}
            {/if}
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
