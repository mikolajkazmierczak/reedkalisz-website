<script>
  import { goto, afterNavigate } from '$app/navigation';
  import { onDestroy } from 'svelte';

  import api from '$lib/api';
  import socket from '$lib/admin/heimdall';
  import { page } from '$lib/admin/stores';
  import { getSearchParams, setSearchParams, makeTree } from '$lib/utils';

  import { updateGlobal, categories } from '$lib/admin/global';
  import { search as fields } from '$lib/fields/products';
  import Category from '$lib/admin/editors/product/Category.svelte';
  import Button from '$lib/admin/input/Button.svelte';
  import Table from '$lib/admin/common/Table.svelte';
  import Search from '$lib/admin/common/Search.svelte';

  $page = { title: 'Produkty', icon: 'products' };

  let category = null;
  afterNavigate(navigation => {
    const searchParams = getSearchParams(['c']); // category
    if (searchParams.c != null) category = searchParams.c;
    setSearchParams({ c: category }, navigation, '/admin/produkty');
  });
  $: setSearchParams({ c: category });

  let selectedLimit;
  let selectedPage;
  let selectedQuery;

  $: if (category != null || selectedLimit != null) {
    // reset page on category or limit change
    selectedPage = 1;
  }

  let categoriesTree;
  let products;

  async function readProducts(category = null, limit = 25, page = 1, query = null) {
    // if (products) products.data = []; // clear to indicate loading
    if (categoriesTree) {
      const filter = category ? { categories: { category: { _eq: category } } } : {};
      products = await api.items('products').readByQuery({ fields, filter, limit, page, search: query, meta: '*' });
    }
  }

  async function readCategories() {
    await updateGlobal(categories);
    categoriesTree = makeTree($categories);
  }

  async function read() {
    await readCategories();
    await readProducts(category, selectedLimit, selectedPage, selectedQuery);
  }

  $: readProducts(category, selectedLimit, selectedPage, selectedQuery);

  read();

  async function listener(data) {
    const itemIds = products.data.map(item => item.id);
    const matchProducts = socket.checkMatch(data, 'products', itemIds);
    if (matchProducts.match) readProducts(category, selectedLimit, selectedPage, selectedQuery);
    const matchCategories = socket.checkMatch(data, 'categories');
    if (matchCategories.match) readCategories();
  }
  socket.onChanges(listener);
  onDestroy(() => socket.offChanges(listener));
</script>

<div class="wrapper">
  {#if categoriesTree}
    <sidebar>
      <div>
        <h3 class="title">Kategorie</h3>
        <Category id={null} name={'Wszystkie'} enabled children={[]} depth={0} bind:selected={category} />
        {#each categoriesTree as { id, name, enabled, children }, i}
          <Category {id} {name} {enabled} {children} depth={i + 1} bind:selected={category} />
        {/each}
      </div>
    </sidebar>
  {/if}

  {#if products}
    <div class="items">
      <div class="actions">
        <Button on:click={() => goto(`/admin/produkty/+${category ? `?c=${category}` : ''}`)} icon="add">Dodaj</Button>
        <Search bind:query={selectedQuery} />
      </div>

      <Table
        rootPathname="/admin/produkty"
        collection="products"
        items={products.data}
        itemsCount={products.meta.filter_count}
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
        bind:limit={selectedLimit}
        bind:page={selectedPage}
        bind:query={selectedQuery}
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

  sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem 1rem;
    min-width: 350px;
    border-radius: var(--border-radius);
    border: var(--border-light);
    background-color: var(--light);
  }
  sidebar .title {
    margin-bottom: 0.5rem;
  }

  .items {
    overflow-x: auto;
  }
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: var(--border-radius);
    border: var(--border-light);
    background-color: var(--light);
  }
</style>
