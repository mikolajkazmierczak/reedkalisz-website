<script>
  import { marked } from 'marked';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { tell } from '@/dialog';
  import { SearchParams } from '$/searchparams';
  import { edit as fields, defaults } from '%/fields/categories';
  import { categoryLabels, categoryOptions } from '@/categories';
  import { deep, slugify, diff } from '%/utils';

  import editing from '@/editors/editing';
  import { unsaved } from '@/stores';
  import { globals, categories } from '@/globals';
  import Editor from '@/editors/Editor.svelte';
  import Blames from '@/editors/Blames.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Modal from '@c/Modal.svelte';

  const searchParams = SearchParams.read();

  export let slug;

  let item;
  let itemOriginal;

  $: hasChildren = $categories?.find((category) => category.parent == item?.id);

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

  // the bar's delete: the popup (it asks for a replacement), unless there are subcategories
  function removeFromBar() {
    if (hasChildren)
      tell('Najpierw usuń podkategorie albo przenieś je gdzie indziej.', {
        title: 'Nie można usunąć kategorii, która ma podkategorie',
      });
    else removeOpen();
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
    const productsIds = products.map((p) => p.id);
    // the replacement for the products that don't have it yet
    const updates = products
      .filter((p) => !p.categories.some((c) => c.category === deletingSwapId))
      .map((p) => ({
        id: p.id,
        categories: p.categories.map((c, index) =>
          c.category == item.id ? { index, category: deletingSwapId } : { index, ...c },
        ),
      }));

    // remove category (and it's occurrences in products); the popup has already asked
    await editing.remove('categories', item.id, {
      root: '/admin/kategorie',
      prompt: false,
      parent: item.parent,
      index: item.index,
    });
    if (deletingSwapId && updates.length) await api.items('products').updateBatch(updates);
    if (productsIds.length) heimdall.emit('products', productsIds);

    deleting = false;
    removeClose();
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

{#if deletingOpen}
  <Modal title="Na pewno?" maxWidth="24rem" on:close={removeClose}>
    <small>Kategoria zostanie usunięta z powiązanych produktów.</small>
    <Input
      type="select"
      bind:value={deletingSwapId}
      options={[
        { id: null, text: 'Brak zamiennika', special: true },
        ...categoryOptions(categoryLabels($categories)).filter((o) => o.id !== item?.id),
      ]}>
      Możesz wybrać zamiennik
    </Input>
    <div class="ui-pair">
      <Button icon="close" secondary edge on:click={removeClose}>Anuluj</Button>
      <Button dangerous on:click={remove}>
        {#if deleting}Usuwanie...{:else}Usuń{/if}
      </Button>
    </div>
  </Modal>
{/if}

<Editor
  root="/admin/kategorie"
  icon="categories"
  title={item?.name}
  collection="categories"
  removable={!!itemOriginal?.date_created}
  remove={removeFromBar}
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
              <a href="/kategorie/{item.slug}" rel="noreferrer" target="_blank">/kategorie/{item.slug}</a>
            {:else}
              /kategorie/{item.slug || '...'}
            {/if}
            <Blames {item} />
          </div>
        </div>
      </div>
    </section>

    <section class="ui-section">
      <h2 class="ui-h2"><span>Opis</span></h2>

      <div class="ui-section__row">
        <div class="ui-section__col ui-box" style:grid-column={'1 / -1'}>
          <div class="ui-pair ui-texteditor">
            <div class="ui-texteditor__draft">
              <Input
                type="textarea"
                bind:value={item.description}
                rows={15}
                placeholder="Przed Tobą stoi puste płótno, zapełnij je czymś niezwykłym..." />
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
