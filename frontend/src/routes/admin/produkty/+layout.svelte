<script>
  import { goto, afterNavigate } from '$app/navigation';
  import { onDestroy } from 'svelte';

  import api from '$lib/api';
  import socket from '$lib/admin/heimdall';
  import { page } from '$lib/admin/stores';
  import { getSearchParams, setSearchParams, makeTree } from '$lib/utils';

  import { updateGlobal, categories } from '$lib/admin/global';
  import { search as fields } from '$lib/fields/products';
  import Table from '$lib/admin/common/Table.svelte';
  import Category from '$lib/admin/editors/product/Category.svelte';
  import Button from '$lib/admin/input/Button.svelte';

  $page = { title: 'Produkty', icon: 'products' };

  let categoriesTree;

  let selectedCategory = null;
  afterNavigate(navigation => {
    const searchParams = getSearchParams(['c']); // category
    console.log('hello', searchParams, navigation.from.url.href, navigation.to.url.href);
    if (searchParams.c != null) selectedCategory = searchParams.c;
    setSearchParams({ c: selectedCategory }, navigation, '/admin/produkty');
  });
  $: setSearchParams({ c: selectedCategory });

  let products;

  async function readProducts(category = null) {
    products = []; // clear to indicate loading
    if (categoriesTree) {
      const filter = category ? { categories: { category: { _eq: category } } } : {};
      products = (await api.items('products').readByQuery({ fields, limit: 100, page: 1, filter })).data;
    }
  }

  async function readCategories() {
    await updateGlobal(categories);
    categoriesTree = makeTree($categories);
  }

  async function read() {
    await readCategories();
    await readProducts();
  }

  $: readProducts(selectedCategory);

  read();

  async function listener(data) {
    const itemIds = products.map(item => item.id);
    const matchProducts = socket.checkMatch(data, 'products', itemIds);
    if (matchProducts.match) readProducts();
    const matchCategories = socket.checkMatch(data, 'categories');
    if (matchCategories.match) readCategories();
  }
  socket.onChanges(listener);
  onDestroy(() => socket.offChanges(listener));
</script>

<div class="wrapper">
  {#if categoriesTree}
    <div class="categories">
      <div class="top">
        <h3 class="title">Kategorie</h3>
      </div>
      <Category id={null} name={'Wszystkie'} enabled children={[]} depth={0} bind:selected={selectedCategory} />
      {#each categoriesTree as { id, name, enabled, children }, i}
        <Category {id} {name} {enabled} {children} depth={i + 1} bind:selected={selectedCategory} />
      {/each}
    </div>
  {/if}

  {#if products}
    <div class="products">
      <div class="actions">
        <Button
          on:click={() => goto(`/admin/produkty/+${selectedCategory ? `?c=${selectedCategory}` : ''}`)}
          icon="add"
        >
          Dodaj
        </Button>
      </div>

      <Table
        rootPathname="/admin/produkty"
        collection="products"
        items={products}
        head={[
          { checkbox: true, icon: 'eye' },
          { checkbox: true, icon: 'new' },
          { checkbox: true, icon: 'sale' },
          { id: true, label: 'ID' },
          { label: 'Kod' },
          { label: 'Nazwa' },
          { blame: true, label: 'Dodano' },
          { blame: true, label: 'Zaktualizowano' }
        ]}
        mapper={$ => ({
          href: `/admin/produkty/${$.slug}`,
          values: [
            $.enabled,
            $.new,
            $.sale,
            $.id,
            $.code,
            $.name,
            { user: $.user_created, datetime: $.date_created },
            { user: $.user_updated, datetime: $.date_updated }
          ]
        })}
      />
    </div>
  {/if}
</div>

<slot />

<style>
  .wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }

  .categories {
    padding: 1rem;
    min-width: 350px;
    border-radius: var(--border-radius);
    border: var(--border-light);
    background-color: var(--light);
  }
  .categories .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 0.5rem;
    padding-bottom: 0.25rem;
  }

  .products {
    overflow-x: auto;
  }
  .products .actions {
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: var(--border-radius);
    border: var(--border-light);
    background-color: var(--light);
  }
</style>
