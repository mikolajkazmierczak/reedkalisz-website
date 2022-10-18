<script>
  import { onDestroy } from 'svelte';
  import { page as pageStore } from '$app/stores';

  import api from '$lib/api';
  import socket from '$lib/admin/heimdall';
  import { edited, save, cancel } from '$lib/admin/stores';
  import editing from '$lib/admin/editing';
  import { diff, makeTree, treeFlatten } from '$lib/utils';

  import slugify from 'slugify';
  import { marked } from 'marked';
  import Input from '$lib/admin/input/Input.svelte';
  import Button from '$lib/admin/input/Button.svelte';
  import Blame from '$lib/admin/common/Blame.svelte';

  import { updateGlobal, users, companies, categories } from '$lib/admin/global';
  import { edit as fields, defaults } from '$lib/fields/products';
  import ProductPricing from '$lib/admin/collections/product/ProductPricing.svelte';
  import ProductStorage from '$lib/admin/collections/product/ProductStorage.svelte';
  import ProductGallery from '$lib/admin/collections/product/ProductGallery.svelte';

  const searchParams = {
    c: Number($pageStore.url.searchParams.get('c'))
  };

  const fieldsToIgnore = ['user_created', 'date_created', 'user_updated', 'date_updated'];

  export let slug;
  export let title;
  $: if (item) title = item.name;

  let item;
  let itemOriginal;
  let itemDiff;

  $save = async () => {
    [item, itemOriginal] = await editing.save(
      'products',
      item,
      itemOriginal,
      fields,
      fieldsToIgnore,
      item.slug != slug ? '/admin/produkty/' + item.slug : null
    );
  };
  $cancel = async () => {
    [item, itemOriginal] = await editing.cancel(item, itemOriginal, '/admin/produkty');
  };

  async function read() {
    await updateGlobal(companies);
    await updateGlobal(categories);

    if (slug == '+') {
      item = defaults();
      // add category from search params
      if (searchParams.c) item.categories = [...item.categories, { category: searchParams.c }];
    } else {
      item = (await api.items('products').readByQuery({ fields, filter: { slug: { _eq: slug } } })).data[0];
    }
    itemOriginal = item ? JSON.parse(JSON.stringify(item)) : null;
  }

  function deleteProduct() {
    editing.del('products', item.id, '/admin/produkty', 'Czy na pewno chcesz usunąć produkt?');
  }

  function pushCategory() {
    item.categories.push({ category: $categories[0].id });
    item = item;
  }
  function removeCategory(i) {
    item.categories.splice(i, 1);
    item = item;
  }

  read();

  $: if (item) item.slug = slugify(item?.code + '-' + item?.name, { lower: true, strict: true });
  $: correctSlug = item && !['+', ''].includes(item.slug);

  $: diff(item, itemOriginal, fieldsToIgnore).then(({ changed, html }) => {
    itemDiff = html;
    $edited = correctSlug && changed;
  });

  async function listener(data) {
    if (data.collection == 'products' && data.ids.includes(item.id)) {
      // WIP
      alert(
        'UWAGA!\nInny użytkownik właśnie wprowadził zmiany w tym dokumencie!\nMożliwe że nadpiszesz jego zmiany...'
      );
      // TODO:
      // update the product but do not remove current changes
      // compare original to current and save the made changes then replace original with updated
      // compare object fields; compare array elements by ids -> if the id doesnt exist it is a new element so it was just added
      // don't worry about prices having switched id's and thus overwriting previous changes, they are constantly recalcualted anyway
      // const productCopy = JSON.parse(JSON.stringify(product));
      // const productOriginalCopy = JSON.parse(JSON.stringify(productOriginal));
      // const productUpdates = await api.items('products').readOne(product.id, { fields });
    }
  }
  socket.onChanges(listener);
  onDestroy(() => socket.offChanges(listener));
</script>

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
          <Input bind:value={item.code}>Kod</Input>
        </div>
        <div class="ui-box">
          <h3 class="ui-h3">Kategorie</h3>
          {#each item.categories as { category }, i}
            <div class="ui-list">
              {#await makeTree($categories) then tree}
                <Input
                  type="select"
                  bind:value={category}
                  options={treeFlatten(tree).map(({ id, name, _meta }) => {
                    const path = _meta.path.map(p => p + 1).join('.');
                    return { id, text: `${path} ${name}` };
                  })}
                />
              {/await}
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
          <Button icon="delete" on:click={deleteProduct} dangerous>Usuń</Button>
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

      <div class="ui-section__col">
        <div class="diff">
          EDITED: {$edited}
          <h3 class="ui-h3">PRODUCT</h3>
          <pre>{@html itemDiff}</pre>
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

  <ProductPricing bind:product={item} />
  <ProductStorage bind:product={item} />
  <ProductGallery bind:gallery={item.gallery} />
{/if}

<style>
  .diff {
    overflow-y: scroll;
    border: var(--border);
    padding: 1rem;
    max-height: 500px;
    overflow-wrap: break-word;
  }
</style>
