<script>
  import { goto } from '$app/navigation';

  import api from '$/api';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';

  import { globals, colors } from '@/globals';
  import { search as fields } from '$/fields/colors';
  import Button from '@c/Button.svelte';
  import Table from '@c/Table.svelte';
  import Search from '@c/Search.svelte';

  $header = { title: 'Kolory', icon: 'colors' };

  const searchParams = new SearchParams('/admin/kolory');
  $: [limit, page, query] = $searchparams.get(searchParams.pathname).values();

  let items;
  let itemsCount;

  async function read(limit, page, query) {
    if (query) {
      const options = { fields, limit, page, search: query, meta: '*' };
      const res = await api.items('colors').readByQuery(options);
      items = res.data;
      itemsCount = res.meta.filter_count;
    } else {
      items = $colors;
      itemsCount = -1;
    }
  }

  globals.update(colors);
  $: $colors && read(limit, page, query);
</script>

{#if items}
  <div class="wrapper">
    <div class="actions">
      <Button on:click={() => goto(`/admin/kolory/+`)} icon="add">Dodaj</Button>
      <Search {searchParams} {query} />
    </div>

    <Table
      collection="colors"
      {itemsCount}
      {items}
      head={[
        { checkbox: true, icon: 'eye', label: 'Widoczność' },
        { id: true, label: 'ID' },
        { label: 'Nazwa' },
        { color: true, label: 'Kolor' },
        { blame: true, label: 'Utworzenie' },
        { blame: true, label: 'Aktualizacja' }
      ]}
      mapper={$ => ({
        href: `/admin/kolory/${$.id}`,
        values: [
          $.enabled,
          $.id,
          $.name,
          $.color,
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
