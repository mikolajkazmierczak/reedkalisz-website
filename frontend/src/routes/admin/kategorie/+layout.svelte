<script>
  import { goto } from '$app/navigation';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { header } from '@/stores';
  import { searchparams, SearchParamsManager } from '$/searchparams';
  import { makeTree, treeFlatten } from '$/utils';

  import { updateGlobal, categories } from '@/globals';
  import { search as fields } from '$/fields/categories';
  import Table from '@c/Table.svelte';
  import Button from '@c/Button.svelte';
  import Search from '@c/Search.svelte';

  $header = { title: 'Kategorie', icon: 'categories' };

  const searchParams = new SearchParamsManager('/admin/kategorie');
  $: [query] = $searchparams.get(searchParams.pathname).values();

  let items;

  async function read(query) {
    await updateGlobal(categories);
    const tree = makeTree($categories);
    if (query) {
      const flat = treeFlatten(tree);
      const queried = (await api.items('categories').readByQuery({ fields, limit: -1, search: query })).data;
      items = flat.filter(category => queried.some(c => c.id === category.id));
    } else {
      items = tree;
    }
  }

  $: read(query);

  heimdall.listen(({ match }) => {
    if (match('categories')) read(query);
  });
</script>

{#if items}
  <div class="wrapper">
    <div class="actions">
      <Button on:click={() => goto(`/admin/kategorie/+?index=${items.length}`)} icon="add">Dodaj</Button>
      <Search {searchParams} {query} />
    </div>

    <Table
      collection="categories"
      itemsCount={-1}
      bind:items
      head={[
        { checkbox: true, icon: 'eye' },
        { id: true, label: 'ID' },
        { label: 'Nazwa' },
        { blame: true, label: 'Dodano' },
        { blame: true, label: 'Zaktualizowano' }
      ]}
      mapper={$ => ({
        href: '/admin/kategorie/' + $.slug,
        values: [
          $.enabled,
          $.id,
          $._meta.path.map(p => p + 1).join('.') + ' ' + $.name,
          { user: $.user_created, datetime: $.date_created },
          { user: $.user_updated, datetime: $.date_updated }
        ]
      })}
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
