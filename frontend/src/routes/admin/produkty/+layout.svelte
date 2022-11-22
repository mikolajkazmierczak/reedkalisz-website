<script>
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { header } from '@/stores';
  import { searchparams, SearchParamsManager } from '$/searchparams';

  import { categories } from '@/globals';
  import { search as fields } from '$/fields/products';
  import Button from '@c/Button.svelte';
  import Table from '@c/Table.svelte';
  import Search from '@c/Search.svelte';
  import Categories from './Categories.svelte';

  $header = { title: 'Produkty', icon: 'products' };

  const searchParams = new SearchParamsManager('/admin/produkty');
  $: [limit, page, query, category] = $searchparams.get(searchParams.pathname).values();

  // reset page when category changes
  $: category || searchParams.set({ p: 1 });

  let products;

  async function read(limit, page, query, category) {
    const filter = category ? { categories: { category: { _eq: category } } } : {};
    products = await api.items('products').readByQuery({ fields, filter, limit, page, search: query, meta: '*' });
    console.log('read: products');
  }

  $: $categories && read(limit, page, query, category);

  heimdall.listen(({ match }) => {
    const itemIds = products.data.map(item => item.id);
    if (match('products', itemIds)) read(limit, page, query, category);
  });
</script>

<div class="wrapper">
  <Categories {searchParams} {category} />

  {#if products}
    <div class="items">
      <div class="actions">
        <div>
          <Button on:click={() => goto(`/admin/produkty/+`)} icon="add">Dodaj</Button>
          {#if category}
            <div transition:fade={{ duration: 100 }}>
              <Button on:click={() => goto(`/admin/produkty/+?c=${category}`)} icon="add">
                <span>Dodaj w <small>{$categories.find(c => c.id == category).name}</small></span>
              </Button>
            </div>
          {/if}
        </div>
        <Search {searchParams} {query} />
      </div>

      <Table
        collection="products"
        itemsCount={products.meta.filter_count}
        items={products.data}
        head={[
          { checkbox: true, icon: 'eye' },
          { checkbox: true, icon: 'new' },
          { checkbox: true, icon: 'sale' },
          { id: true, label: 'ID' },
          { label: 'Kod' },
          { label: 'Nazwa' },
          { blame: true, label: 'Utworzenie' },
          { blame: true, label: 'Aktualizacja' }
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
        {searchParams}
        {limit}
        {page}
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
  .actions > div {
    display: flex;
    gap: 0.5rem;
  }
  .actions span {
    white-space: nowrap;
    color: var(--light);
  }
  .actions small {
    color: var(--light);
  }
</style>
