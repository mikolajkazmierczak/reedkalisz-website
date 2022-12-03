<script>
  import { goto } from '$app/navigation';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';

  import { search as fields } from '$/fields/pages';
  import Button from '@c/Button.svelte';
  import Table from '@c/Table.svelte';
  import Search from '@c/Search.svelte';

  $header = { title: 'Strony', icon: 'pages' };

  const searchParams = new SearchParams('/admin/strony');
  $: [limit, page, query] = $searchparams.get(searchParams.pathname).values();

  let items;

  async function read(limit, page, query) {
    const options = { fields, limit, page, search: query, meta: '*' };
    items = await api.items('pages').readByQuery(options);
  }

  $: read(limit, page, query);

  heimdall.listen(({ match }) => {
    if (match('pages')) read(limit, page, query);
  });
</script>

{#if items}
  <div class="wrapper">
    <div class="actions">
      <Button on:click={() => goto(`/admin/strony/+`)} icon="add">Dodaj</Button>
      <Search {searchParams} {query} />
    </div>

    <Table
      collection="pages"
      itemsCount={items.meta.filter_count}
      items={items.data}
      head={[
        { checkbox: true, icon: 'eye', label: 'Widoczność' },
        { id: true, label: 'ID' },
        { label: 'Nazwa' },
        { blame: true, label: 'Utworzenie' },
        { blame: true, label: 'Aktualizacja' }
      ]}
      mapper={$ => ({
        href: `/admin/strony/${$.slug}`,
        values: [
          $.enabled,
          $.id,
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
