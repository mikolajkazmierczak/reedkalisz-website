<script>
  import { marked } from 'marked';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { SearchParamsManager } from '$/searchparams';
  import { edit as fields, defaults } from '$/fields/products';
  import { deep, slugify, diff, makeTree, treeFlatten, moveItem } from '$/utils';

  import editing from '@/editors/editing';
  import { unsaved } from '@/stores';
  import { updateGlobal, users, companies, categories } from '@/globals';
  import Editor from '@/editors/Editor.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Blame from '@c/Blame.svelte';
  import ProductPricing from './ProductPricing.svelte';
  import ProductStorage from './ProductStorage.svelte';
  import ProductGallery from './ProductGallery.svelte';
  import ProductRecommendations from './ProductRecommendations.svelte';

  const searchParams = SearchParamsManager.read();

  export let slug;

  let item;
  let itemOriginal;
  let itemDiff;

  let errors = { code: null };

  async function save(action) {
    try {
      await action();
      errors = { code: null };
    } catch (e) {
      if (e.message == 'Field "code" has to be unique.') {
        errors.code = 'Kod musi być unikalny.';
      } else throw e;
    }
  }

  function remove() {
    editing.remove('products', item.id, { root: '/admin/produkty' });
  }

  async function read() {
    await updateGlobal(companies);
    await updateGlobal(categories);

    if (slug == '+') {
      item = defaults();
      // add category from search params
      if (searchParams.c != null) item.categories = [...item.categories, { category: searchParams.c }];
    } else {
      const filter = { slug: { _eq: slug } };
      item = (await api.items('products').readByQuery({ fields, filter })).data[0];
    }
    itemOriginal = item ? deep.copy(item) : null;
  }

  function pushCategory() {
    item.categories.push({ category: $categories[0].id, index: item.categories.length });
    item = item;
  }
  function removeCategory(i) {
    item.categories.splice(i, 1);
    item.categories = item.categories.map((c, i) => ({ ...c, index: i })); // update indexes
    item = item;
  }
  function moveCategory(i, d) {
    item.categories = moveItem(item.categories, i, d);
  }

  read();

  $: if (item)
    item.slug = slugify(
      item?.code + '-' + item?.name,
      itemOriginal?.code + '-' + itemOriginal?.name,
      itemOriginal?.slug
    );

  $: correctSlug = item && !['+', ''].includes(item.slug);
  $: diff(item, itemOriginal, { editorPreset: true }).then(({ changed, html }) => {
    itemDiff = html;
    $unsaved = correctSlug && changed;
  });

  heimdall.listen(({ match, me }) => {
    if (match('products', item.id) && !me) {
      alert('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.');
    }
  });
</script>

<Editor
  root="/admin/produkty"
  icon="products"
  title={item?.name}
  collection="products"
  bind:item
  bind:itemOriginal
  {save}
>
  {#if item}
    <section class="ui-section">
      <h2 class="ui-h2">Główne</h2>

      <div class="ui-section__row">
        <div class="ui-section__col">
          <div class="ui-box">
            <div class="ui-pair">
              <Input type="checkbox" bind:value={item.enabled}>Widoczny</Input>
              <Input type="checkbox" bind:value={item.new}>Nowość</Input>
            </div>
            <Input bind:value={item.name} error={item.name == '+' ? 'Nazwa zarezerwowana' : false}>Nazwa</Input>
            <Input bind:value={item.code} error={errors.code}>Kod</Input>
          </div>
          <div class="ui-box">
            <h3 class="ui-h3">Kategorie</h3>
            {#each item.categories as { category }, i}
              <div class="ui-list">
                {#await makeTree($categories) then tree}
                  <div class="category" class:main={i == 0}>
                    <Input
                      type="select"
                      bind:value={category}
                      options={treeFlatten(tree).map(({ id, name, _meta }) => {
                        const path = _meta.path.map(p => p + 1).join('.');
                        return { id, text: `${path} ${name}` };
                      })}
                    />
                  </div>
                {/await}
                <Button icon="arrow_up" on:click={() => moveCategory(i, -1)} square disabled={i == 0} />
                <Button
                  icon="arrow_down"
                  on:click={() => moveCategory(i, 1)}
                  square
                  disabled={i == item.categories.length - 1}
                />
                <Button icon="delete" on:click={() => removeCategory(i)} dangerous square />
              </div>
            {/each}
            <Button icon="add" on:click={pushCategory}>Dodaj</Button>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box">
            <h3 class="ui-h3">SEO</h3>
            <Input bind:value={item.seo_title}>Tytuł</Input>
            <Input type="textarea" bind:value={item.seo_description}>Opis</Input>
          </div>
          <div class="ui-box">
            <h3 class="ui-h3">API</h3>
            <Input
              type="select"
              bind:value={item.company}
              options={$companies.map(({ id, name }) => ({ id, text: name }))}
            >
              Producent
            </Input>
            <div class="ui-pair">
              <Input bind:value={item.api_code}>Kod</Input>
              <Input bind:value={item.api_id}>ID</Input>
            </div>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box">
            <Button icon="delete" on:click={remove} dangerous>Usuń</Button>
          </div>

          <div class="ui-box ui-box--uneditable">
            <h3 class="ui-h3">Bezpośredni link</h3>
            <a href="/produkty/{item.slug}">/produkty/{item.slug}</a>
            <h3 class="ui-h3">Dodano</h3>
            <p>
              {#if $users && item.date_created}
                <Blame user={item.user_created} datetime={item.date_created} />
              {:else}
                Tu będziesz ty
              {/if}
            </p>
            <h3 class="ui-h3">Zaktualizowano</h3>
            <p>
              {#if $users && item.date_updated}
                <Blame user={item.user_updated} datetime={item.date_updated} />
              {:else}
                Nie aktualizowano
              {/if}
            </p>
          </div>
        </div>

        <!-- <div class="ui-section__col">
          <div class="diff">
            UNSAVED: {$unsaved}
            <h3 class="ui-h3">PRODUCT</h3>
            <pre>{@html itemDiff}</pre>
          </div>
        </div> -->
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

    <ProductPricing bind:product={item} productOriginal={itemOriginal} />
    <ProductStorage bind:product={item} />
    <ProductGallery bind:gallery={item.gallery} />
    <ProductRecommendations bind:product={item} />
  {/if}
</Editor>

<style>
  /* .diff {
    overflow-y: scroll;
    border: var(--border);
    padding: 1rem;
    max-height: 500px;
    overflow-wrap: break-word;
  } */
  .category.main {
    outline: var(--outline-dashed);
  }
</style>
