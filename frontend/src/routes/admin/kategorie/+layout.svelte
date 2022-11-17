<script>
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';

  import api from '$lib/api';
  import socket from '$lib/admin/heimdall';
  import { page } from '$lib/admin/stores';
  import { makeTree, treeFlatten } from '$lib/utils';

  import { updateGlobal, categories } from '$lib/admin/global';
  import { search as fields } from '$lib/fields/categories';
  import Table from '$lib/admin/common/Table.svelte';
  import Button from '$lib/admin/input/Button.svelte';
  import Search from '$lib/admin/common/Search.svelte';

  $page = { title: 'Kategorie', icon: 'categories' };

  let selectedQuery;
  async function read(query = null) {
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

  let items;

  $: read(selectedQuery);

  async function listener(data) {
    const { match } = socket.checkMatch(data, 'categories');
    if (match) read();
  }
  socket.onChanges(listener);
  onDestroy(() => socket.offChanges(listener));
</script>

{#if items}
  <div class="wrapper">
    <div class="actions">
      <Button on:click={() => goto(`/admin/kategorie/+?index=${items.length}`)} icon="add">Dodaj</Button>
      <Search bind:query={selectedQuery} />
    </div>

    <Table
      rootPathname="/admin/kategorie"
      collection="categories"
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
      order={!selectedQuery}
      limit={-1}
      bind:query={selectedQuery}
    />
  </div>

  <small style="color:red;display:block;margin-top:0.5rem;margin-left:0.5rem;">
    Edycja hierarchii chwilowo niedostępna
  </small>
  <b><small style="color:red;display:block;margin-top:0.25rem;margin-left:0.5rem;"> Nowa w drodze </small></b>
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
