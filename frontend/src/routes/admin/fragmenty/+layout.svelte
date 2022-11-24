<script>
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';

  import { search as fields } from '$/fields/fragments';
  import Table from '@c/Table.svelte';
  import Search from '@c/Search.svelte';

  $header = { title: 'Fragmenty', icon: 'fragments' };

  const searchParams = new SearchParams('/admin/fragmenty');
  $: [limit, page, query] = $searchparams.get(searchParams.pathname).values();

  let items;

  async function read(limit, page, query) {
    const options = { fields, limit, page, search: query, meta: '*' };
    items = await api.items('fragments').readByQuery(options);
  }

  $: read(limit, page, query);

  heimdall.listen(({ match }) => {
    if (match('fragments')) read(limit, page, query);
  });
</script>

{#if items}
  <div class="wrapper">
    <div class="actions">
      <div />
      <Search {searchParams} {query} />
    </div>

    <Table
      collection="fragments"
      itemsCount={items.meta.filter_count}
      items={items.data}
      head={[{ id: true, label: 'ID' }, { label: 'Nazwa' }, { blame: true, label: 'Aktualizacja' }]}
      mapper={$ => ({
        href: `/admin/fragmenty/${$.id}`,
        values: [$.id, $.name, { user: $.user_updated, datetime: $.date_updated }]
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
