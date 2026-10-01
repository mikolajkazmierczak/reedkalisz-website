<script>
  import { goto } from '$app/navigation';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';

  import { search as fields } from '%/fields/pages';
  import Button from '@c/Button.svelte';
  import Table from '@c/table/Table.svelte';
  import Search from '@c/Search.svelte';

  $header = { title: 'Strony', icon: 'pages' };

  const searchParams = new SearchParams('/admin/strony');
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
    const res = await api.items('pages').readByQuery(options);
    if (readId === lastRead) items = res;
  }

  $: read(limit, page, query, sort);

  heimdall.listen(({ match }) => {
    if (match('pages')) read(limit, page, query, sort);
  });
</script>

{#if items}
  <div class="wrapper ui-fill">
    <div class="actions ui-bar">
      <Button on:click={() => goto(`/admin/strony/+`)} icon="add">Dodaj</Button>
      <Search {searchParams} {query} />
    </div>

    <Table
      collection="pages"
      itemsCount={items.meta.filter_count}
      items={items.data}
      head={[
        { checkbox: true, icon: 'eye', label: 'Widoczność' },
        { label: 'Nazwa', sort: 'name', float: true },
        { blame: true, label: 'Utworzenie', sort: 'date_created', float: true },
        { blame: true, label: 'Aktualizacja', sort: 'date_updated', float: true },
      ]}
      mapper={($) => ({
        href: `/admin/strony/${$.slug}`,
        values: [
          $.enabled,
          $.name,
          { user: $.user_created, datetime: $.date_created },
          { user: $.user_updated, datetime: $.date_updated },
        ],
      })}
      {searchParams}
      scrollKey={[query]}
      {sort}
      {limit}
      {page} />
  </div>
{/if}
<slot />
