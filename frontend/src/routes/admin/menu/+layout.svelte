<script>
  import { goto } from '$app/navigation';

  import api from '$/api';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';
  import { makeTree, treeGetItem } from '$/utils';

  import { globals, menus, menuItems, categories } from '@/globals';
  import { search as fields } from '$/fields/menu_items';
  import Table from '@c/Table.svelte';
  import Button from '@c/Button.svelte';
  import Search from '@c/Search.svelte';

  $header = { title: 'Kategorie', icon: 'categories' };

  const searchParams = new SearchParams('/admin/kategorie');
  $: [limit, page, query, menu] = $searchparams.get(searchParams.pathname).values();

  let items;
  let itemsCount;
  $: itemsTree = $menuItems ? makeTree($menuItems) : [];
  $: categoriesItemsTree = $categories ? makeTree($categories) : [];

  async function read(limit, page, query, menu) {
    if (query) {
      const filter = { menu: { _eq: menu } };
      const queried = await api
        .items('menu_items')
        .readByQuery({ fields, filter, limit, page, search: query, meta: '*' });
      items = queried.data;
      itemsCount = queried.meta.filter_count;
    } else {
      items = itemsTree.filter(item => item.menu == menu);
      itemsCount = -1;
    }
  }

  globals.update(menus);
  globals.update(menuItems);
  globals.update(categories);
  $: $menus && $menuItems && read(limit, page, query, menu);
</script>

{#if items && $categories}
  <div class="wrapper">
    <div class="actions">
      <Button on:click={() => goto(`/admin/menu/+?index=${$menuItems.length}&menu=${menu}`)} icon="add">Dodaj</Button>
      <Search {searchParams} {query} />
    </div>

    <Table
      collection="menu_items"
      {itemsCount}
      {items}
      head={[
        { checkbox: true, icon: 'eye' },
        { id: true, label: 'ID' },
        { label: 'Tytuł' },
        { checkbox: true, icon: 'products' },
        { checkbox: true, icon: 'categories' },
        { checkbox: true, icon: 'pages' },
        { checkbox: true, icon: 'link' },
        { label: 'Zasób' },
        { label: 'Link' },
        { blame: true, label: 'Utworzenie' },
        { blame: true, label: 'Aktualizacja' }
      ]}
      mapper={$ => {
        const path = treeGetItem(itemsTree, $.id)._meta.path;
        const categoryPath = $.category ? treeGetItem(categoriesItemsTree, $.category.id)._meta.path : null;
        const resource = $.product
          ? $.page.name
          : $.page
          ? $.page.name
          : $.category
          ? categoryPath.join('.') + ' ' + $.category.name
          : null;
        return {
          href: '/admin/kategorie/' + $.slug,
          values: [
            $.enabled,
            $.id,
            path.join('.') + ' ' + $.name,
            !!$.product,
            !!$.category,
            !!$.page,
            !!$.url,
            resource,
            $.url,
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
