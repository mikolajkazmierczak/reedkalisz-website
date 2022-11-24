<script>
  import { goto } from '$app/navigation';

  import api from '$/api';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';
  import { makeTree, treeGetItem } from '$/utils';

  import { globals, categories } from '@/globals';
  import { search as fields } from '$/fields/categories';
  import Table from '@c/Table.svelte';
  import Button from '@c/Button.svelte';
  import Search from '@c/Search.svelte';

  $header = { title: 'Kategorie', icon: 'categories' };

  const searchParams = new SearchParams('/admin/kategorie');
  $: [limit, page, query] = $searchparams.get(searchParams.pathname).values();

  let items;
  let itemsCount;
  $: itemsTree = $categories ? makeTree($categories) : [];

  async function read(limit, page, query) {
    if (query) {
      const queried = await api.items('categories').readByQuery({ fields, limit, page, search: query, meta: '*' });
      items = queried.data;
      itemsCount = queried.meta.filter_count;
    } else {
      items = itemsTree;
      itemsCount = -1;
    }
  }

  globals.update(categories);
  $: $categories && read(limit, page, query);
</script>

{#if items}
  <div class="wrapper">
    <div class="actions">
      <Button on:click={() => goto(`/admin/kategorie/+?index=${$categories.length}`)} icon="add">Dodaj</Button>
      <Search {searchParams} {query} />
    </div>

    <Table
      collection="categories"
      {itemsCount}
      {items}
      head={[
        { checkbox: true, icon: 'eye' },
        { id: true, label: 'ID' },
        { label: 'Nazwa' },
        { blame: true, label: 'Utworzenie' },
        { blame: true, label: 'Aktualizacja' }
      ]}
      mapper={$ => {
        const path = treeGetItem(itemsTree, $.id)._meta.path;
        return {
          href: '/admin/kategorie/' + $.slug,
          values: [
            $.enabled,
            $.id,
            path.map(p => p + 1).join('.') + ' ' + $.name,
            { user: $.user_created, datetime: $.date_created },
            { user: $.user_updated, datetime: $.date_updated }
          ]
        };
      }}
      {searchParams}
      {limit}
      {page}
      order={!query}
    />
  </div>
{/if}

<slot />

<style>
  .wrapper {
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
