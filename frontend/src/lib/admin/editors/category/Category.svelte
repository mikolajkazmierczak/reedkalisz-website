<script>
  import { marked } from 'marked';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { SearchParamsManager } from '$/searchparams';
  import { edit as fields, defaults } from '$/fields/categories';
  import { deep, slugify, diff } from '$/utils';

  import editing from '@/editors/editing';
  import { unsaved } from '@/stores';
  import { updateGlobal, users, categories } from '@/globals';
  import Editor from '@/editors/Editor.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Blame from '@c/Blame.svelte';
  import Picker from '@c/library/Picker.svelte';

  const searchParams = SearchParamsManager.read();

  export let slug;

  let item;
  let itemOriginal;

  $: hasChildren = $categories?.find(category => category.parent == item?.id);

  async function read() {
    await updateGlobal(categories);

    if (slug == '+') {
      item = defaults();
      // add parent and index from search params
      if (searchParams.parent != null) item.parent = searchParams.parent;
      if (searchParams.index != null) item.index = searchParams.index;
    } else {
      const filter = { slug: { _eq: slug } };
      item = (await api.items('categories').readByQuery({ fields, filter })).data[0];
    }
    itemOriginal = item ? deep.copy(item) : null;
  }

  async function remove() {
    editing.del('categories', item.id, { root: '/admin/kategorie' });
  }

  read();

  $: if (item) item.slug = slugify(item?.name, itemOriginal?.name, itemOriginal?.slug);
  $: correctSlug = item && !['+', ''].includes(item.slug);

  $: diff(item, itemOriginal, { editorPreset: true }).then(({ changed, html }) => {
    console.log(html);
    $unsaved = correctSlug && changed;
  });

  heimdall.listen(({ match, me, data }) => {
    if (match('categories', item.id) && !me) {
      // alert('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.');
      console.log('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.', data);
    }
  });
</script>

<Editor
  root="/admin/kategorie"
  icon="categories"
  title={item?.name}
  collection="categories"
  bind:item
  bind:itemOriginal
>
  {#if item}
    <section class="ui-section">
      <div class="ui-section__row">
        <div class="ui-section__col">
          <div class="ui-box">
            <div class="ui-pair">
              <Input type="checkbox" bind:value={item.enabled}>Widoczny</Input>
            </div>
            <Input bind:value={item.name} error={item.name == '+' ? 'Nazwa zarezerwowana' : false}>Nazwa</Input>
          </div>

          <div class="ui-box">
            <h3 class="ui-h3">SEO</h3>
            <Input bind:value={item.seo_title}>Tytuł</Input>
            <Input type="textarea" bind:value={item.seo_description}>Opis</Input>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box">
            <Button icon="delete" on:click={remove} dangerous disabled={hasChildren}>Usuń</Button>
            {#if hasChildren}
              <p>
                Nie można usunąć kategorii, która ma podkategorie.<br />
                <small>Najpierw usuń lub wysuń wszystkie podkategorie na zewnątrz.</small>
              </p>
            {/if}
          </div>

          <div class="ui-box ui-box--uneditable">
            <h3 class="ui-h3">Link do strony</h3>
            {#if item.date_created}
              <a href="/kategorie/{item.slug}">/kategorie/{item.slug}</a>
            {:else}
              /kategorie/{item.slug || '...'}
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

        <div class="ui-section__col">
          <div class="img">
            <Picker bind:selected={item.img} />
          </div>
        </div>
      </div>
    </section>

    <section class="ui-section">
      <h2 class="ui-h2">Opis</h2>

      <div class="ui-section__row">
        <div class="ui-section__col ui-box" style:grid-column={'1 / span 4'}>
          <div class="ui-pair ui-texteditor">
            <div class="ui-texteditor__draft">
              <Input
                type="textarea"
                bind:value={item.description}
                rows={15}
                placeholder="Przed Tobą stoi puste płótno, zapełnij je czymś niezwykłym..."
              />
            </div>
            <div class="ui-texteditor__render">
              {#if item.description}
                {@html marked.parse(item.description)}
              {/if}
            </div>
          </div>
        </div>
      </div>
    </section>
  {/if}
</Editor>

<style>
  .img {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
    gap: 1rem;
  }
</style>
