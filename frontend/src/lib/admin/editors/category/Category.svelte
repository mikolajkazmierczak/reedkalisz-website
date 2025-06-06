<script>
  import { marked } from 'marked';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { SearchParams } from '$/searchparams';
  import { edit as fields, defaults } from '%/fields/categories';
  import { deep, slugify, diff, makeTree, treeFlatten } from '%/utils';

  import editing from '@/editors/editing';
  import { unsaved } from '@/stores';
  import { globals, users, categories } from '@/globals';
  import Editor from '@/editors/Editor.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Blame from '@c/Blame.svelte';
  import Picker from '@c/library/Picker.svelte';
  import Popup from '@c/Popup.svelte';

  const searchParams = SearchParams.read();

  export let slug;

  let item;
  let itemOriginal;

  $: hasChildren = $categories?.find(category => category.parent == item?.id);

  let deletingOpen = false;
  let deleting = false; // prevent double click
  let deletingSwapId = null; // id of the category that is being swapped with the one being deleted

  async function read() {
    await globals.update(categories);
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

  function removeOpen() {
    deletingOpen = true;
  }
  function removeClose() {
    deletingSwapId = null;
    deletingOpen = false;
  }
  async function remove() {
    if (deleting) return; // prevent double click
    deleting = true;

    // get all products that use this category
    const filter = { categories: { category: { _eq: item.id } } };
    const fields = ['id', 'categories.id', 'categories.category'];
    const products = (await api.items('products').readByQuery({ fields, filter, limit: -1 })).data;
    const productsIds = products.map(p => p.id);
    const categoriesIds = products.map(p => p.categories.map(c => c.category)).flat();

    // remove category (and it's occurrences in products)
    const confirmed = await editing.remove('categories', item.id, {
      root: '/admin/kategorie',
      parent: item.parent,
      index: item.index
    });

    if (confirmed && productsIds) {
      if (deletingSwapId && !categoriesIds.includes(deletingSwapId)) {
        for (const p of products) {
          const categories = p.categories.map((c, index) => {
            return c.category == item.id ? { index, category: deletingSwapId } : { index, ...c };
          });
          await api.items('products').updateOne(p.id, { categories });
        }
      }
      heimdall.emit('products', productsIds);
    }

    deleting = false;
    removeClose();
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

  heimdall.listen(({ match, me, data }) => {
    if (match('categories', item.id) && !me) {
      // alert('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.');
      console.log('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.', data);
    }
  });
</script>

<Popup title="Na pewno?" maxWidth={'300px'} bind:opened={deletingOpen} on:close={removeClose}>
  <small>Kategoria zostanie usunięta z powiązanych produktów.</small>
  <Input
    type="select"
    bind:value={deletingSwapId}
    options={[
      { id: null, text: 'Brak zamiennika' },
      ...treeFlatten(makeTree($categories)).map(({ id, name, _meta }) => {
        const path = _meta.path.map(p => p + 1).join('.');
        return { id, text: `${path} ${name}` };
      })
    ]}
  >
    Możesz wybrać zamiennik
  </Input>
  <div class="ui-pair popup-actions">
    <Button on:click={removeClose}>Anuluj</Button>
    <Button on:click={remove} dangerous>
      {#if deleting}Usuwanie...{:else}Usuń{/if}
    </Button>
  </div>
</Popup>

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
            <Input bind:value={item.name}>Nazwa</Input>
          </div>

          <div class="ui-box">
            <h3 class="ui-h3">SEO</h3>
            <Input bind:value={item.seo_title}>Tytuł</Input>
            <Input type="textarea" bind:value={item.seo_description}>Opis</Input>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box">
            <Button icon="delete" on:click={removeOpen} dangerous disabled={item.id === '+' || hasChildren}>
              Usuń
            </Button>
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
              <a href="/kategorie/{item.slug}" rel="noreferrer" target="_blank">/kategorie/{item.slug}</a>
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
