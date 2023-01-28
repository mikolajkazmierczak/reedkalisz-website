<script>
  import { marked } from 'marked';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { edit as fields, defaults } from '%/fields/pages';
  import { deep, slugify, diff } from '%/utils';

  import editing from '@/editors/editing';
  import { unsaved } from '@/stores';
  import { users } from '@/globals';
  import Editor from '@/editors/Editor.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Blame from '@c/Blame.svelte';

  export let slug;

  let item;
  let itemOriginal;

  function remove() {
    editing.remove('pages', item.id, { root: '/admin/strony' });
  }

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
      slugOriginal: itemOriginal?.slug
    });

  $: correctSlug = item && !['+', ''].includes(item.slug);
  $: diff(item, itemOriginal, { editorPreset: true }).then(({ changed }) => {
    $unsaved = correctSlug && changed;
  });

  heimdall.listen(({ match, me }) => {
    if (match('pages', item.id) && !me) {
      alert('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.');
    }
  });
</script>

<Editor root="/admin/strony" icon="pages" title={item?.name} collection="pages" bind:item bind:itemOriginal>
  {#if item}
    <section class="ui-section">
      <div class="ui-section__row">
        <div class="ui-section__col">
          <div class="ui-box">
            <Input bind:value={item.name}>Tytuł</Input>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box">
            <h3 class="ui-h3">SEO</h3>
            <Input bind:value={item.seo_title}>Tytuł</Input>
            <Input type="textarea" bind:value={item.seo_description}>Opis</Input>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box">
            <Button icon="delete" on:click={remove} dangerous>Usuń</Button>
          </div>

          <div class="ui-box ui-box--uneditable">
            <h3 class="ui-h3">Link do strony</h3>
            {#if item.date_created}
              <a href="/{item.slug}" rel="noreferrer" target="_blank">/{item.slug}</a>
            {:else}
              /{item.slug || '...'}
            {/if}
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
