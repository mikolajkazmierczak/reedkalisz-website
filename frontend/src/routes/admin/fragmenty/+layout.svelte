<script>
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';

  import { search as fields } from '%/fields/fragments';
  import Table from '@c/table/Table.svelte';
  import Search from '@c/Search.svelte';

  $header = { title: 'Fragmenty', icon: 'fragments' };

  const searchParams = new SearchParams('/admin/fragmenty');
  $: [limit, page, query, sort] = $searchparams.get(searchParams.pathname).values();

  let items;
  let lastRead = 0; // several reads can be in flight (every change of the url starts one): only the newest counts

  async function read(limit, page, query, sort) {
    const readId = ++lastRead;
    const options = {
      fields,
      ...(sort && { sort: [sort] }),
      limit,
      page,
      search: query,
      meta: '*',
    };
    const res = await api.items('fragments').readByQuery(options);
    if (readId === lastRead) items = res;
  }

  $: read(limit, page, query, sort);

  heimdall.listen(({ match }) => {
    if (match('fragments')) read(limit, page, query, sort);
  });
</script>

{#if items}
  <div class="wrapper">
    <div class="actions ui-bar">
      <div />
      <Search {searchParams} {query} />
    </div>

    <Table
      collection="fragments"
      itemsCount={items.meta.filter_count}
      items={items.data}
      head={[
        { label: 'Nazwa', sort: 'name', float: true },
        { blame: true, label: 'Aktualizacja', sort: 'date_updated', float: true },
      ]}
      mapper={($) => ({
        href: `/admin/fragmenty/${$.id}`,
        values: [$.name, { user: $.user_updated, datetime: $.date_updated }],
      })}
      {searchParams}
      {sort}
      {limit}
      {page} />
  </div>
{/if}
<slot />

<style>
  .wrapper {
    overflow-x: auto;
  }
</style>
