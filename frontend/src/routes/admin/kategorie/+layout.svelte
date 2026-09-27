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
</script>

{#if $categories}
  <div class="wrapper">
    <div class="actions ui-bar">
      <Button on:click={() => goto(`/admin/kategorie/+?index=${itemsTree.length}`)} icon="add">Dodaj</Button>
      <Search {searchParams} {query} />
    </div>

    <Table
      collection="categories"
      {itemsCount}
      {items}
      head={[
        { checkbox: true, icon: 'eye', label: 'Widoczność' },
        { label: 'Nazwa', float: true, category: true },
        { blame: true, label: 'Utworzenie', float: true },
        { blame: true, label: 'Aktualizacja', float: true },
      ]}
      mapper={($) => {
        const treeItem = treeGetItem(itemsTree, $.id);
        const code = treeItem._meta.path.map((p) => p + 1).join('.');
        return {
          href: '/admin/kategorie/' + $.slug,
          hrefNew: `/admin/kategorie/+?parent=${$.id}&index=${treeItem.children.length}`,
          codeNew: `${code}.${treeItem.children.length + 1}`,
          values: [
            $.enabled,
            { code, name: $.name },
            { user: $.user_created, datetime: $.date_created },
            { user: $.user_updated, datetime: $.date_updated },
          ],
        };
      }}
      {searchParams}
      {limit}
      {page}
      order={!query} />
  </div>
{/if}

<slot />

<style>
  .wrapper {
    overflow-x: auto;
  }
</style>
