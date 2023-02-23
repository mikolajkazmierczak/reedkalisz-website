<script>
  import { goto } from '$app/navigation';

  import api from '$/api';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';
  import { makeTree, treeGetItem } from '%/utils';

  import { globals, categories } from '@/globals';
  import { search as fields } from '%/fields/categories';
  import Table from '@c/table/Table.svelte';
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
  // TODO: it seems like the list doesn't update when sometimes (e.g. when adding new items), why?
  // $: $categories && console.log('categories', $categories);
</script>

{#if $categories}
  <div class="wrapper">
    <div class="actions">
      <Button on:click={() => goto(`/admin/kategorie/+?index=${itemsTree.length}`)} icon="add">Dodaj</Button>
      <Search {searchParams} {query} />
    </div>

    <Table
      collection="categories"
      {itemsCount}
      {items}
      head={[
        { checkbox: true, icon: 'eye', label: 'Widoczność' },
        { id: true, label: 'ID' },
        { label: 'Nazwa' },
        { blame: true, label: 'Utworzenie' },
        { blame: true, label: 'Aktualizacja' }
      ]}
      mapper={$ => {
        const treeItem = treeGetItem(itemsTree, $.id);
        const itemLabel = treeItem._meta.path.map(p => p + 1).join('.') + ' ' + $.name;
        return {
          href: '/admin/kategorie/' + $.slug,
          hrefNew: `/admin/kategorie/+?parent=${$.id}&index=${treeItem.children.length}`,
          values: [
            $.enabled,
            $.id,
            itemLabel,
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
