<script>
  import { goto } from '$app/navigation';

  import api from '$/api';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';
  import { makeTree, treeGetItem } from '$/utils';

  import { globals, menus, menuItems, categories } from '@/globals';
  import { search as fields } from '$/fields/menu_items';
  import Table from '@c/Table.svelte';
  import Filters from '@c/Filters.svelte';
  import Button from '@c/Button.svelte';
  import Search from '@c/Search.svelte';

  $header = { title: 'Menu', icon: 'menu' };

  const searchParams = new SearchParams('/admin/menu');
  $: [limit, page, query, menu] = $searchparams.get(searchParams.pathname).values();

  function setMenu(m) {
    searchParams.set({ m });
    menu = m;
  }

  $: selectedMenu = menu;
  $: if (selectedMenu == null && $menus) selectedMenu = $menus[0].id;
  $: selectedMenu != menu && setMenu(selectedMenu);

  let items;
  let itemsCount;
  $: itemsTree = $menus && $menuItems ? makeTree($menuItems.filter(item => item.menu === menu)) : [];
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
      items = itemsTree;
      itemsCount = -1;
    }
  }

  globals.update(menus);
  globals.update(menuItems);
  globals.update(categories);
  $: $menus && $menuItems && $categories && read(limit, page, query, menu);
</script>

{#if $menus && $menuItems && $categories}
  <div class="wrapper">
    <div class="actions">
      <div>
        <Button on:click={() => goto(`/admin/menu/+?index=${itemsTree.length}&menu=${menu}`)} icon="add">Dodaj</Button>
        <Filters filters={$menus.map(({ id, name }) => ({ label: name, value: id }))} bind:selected={selectedMenu} />
      </div>
      <Search {searchParams} {query} />
    </div>

    {#if menu != null}
      <Table
        collection="menu_items"
        {itemsCount}
        {items}
        head={[
          { checkbox: true, icon: 'eye' },
          { id: true, label: 'ID' },
          { label: 'Tytuł' },
          { checkbox: true, icon: 'folder' },
          { checkbox: true, icon: 'products' },
          { checkbox: true, icon: 'categories' },
          { checkbox: true, icon: 'pages' },
          { label: 'Element' },
          { blame: true, label: 'Utworzenie' },
          { blame: true, label: 'Aktualizacja' }
        ]}
        mapper={$ => {
          const getCategoryLabel = () => {
            const categoryPath = $.category ? treeGetItem(categoriesItemsTree, $.category.id)._meta.path : null;
            return categoryPath.map(p => p + 1).join('.') + ' ' + $.category.name;
          };
          const treeItem = treeGetItem(itemsTree, $.id);
          // TODO: investigate why is treeItem undefined at first when moving an item from children to parent
          const itemLabel = treeItem?._meta.path.map(p => p + 1).join('.') + ' ' + $.name;
          const resource = $.product ? $.product.name : $.page ? $.page.name : $.category ? getCategoryLabel() : $.url;
          return {
            href: '/admin/menu/' + $.id,
            hrefNew: `/admin/menu/+?parent=${$.id}&index=${treeItem?.children.length}&menu=${menu}`,
            values: [
              $.enabled,
              $.id,
              itemLabel,
              !!$.folder,
              !!$.product,
              !!$.category,
              !!$.page,
              resource,
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
    {/if}
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
  .actions > div {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
</style>
