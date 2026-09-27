<script>
  import { goto } from '$app/navigation';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';

  import { search as fields } from '%/fields/questions';
  import Button from '@c/Button.svelte';
  import Table from '@c/table/Table.svelte';
  import Search from '@c/Search.svelte';

  $header = { title: 'Zapytania', icon: 'questions' };

  const searchParams = new SearchParams('/admin/zapytania');
  $: [limit, page, query, sort] = $searchparams.get(searchParams.pathname).values();

  let items;
  let lastRead = 0; // several reads can be in flight (every change of the url starts one): only the newest counts

  // the order when none is picked (see Table's `sort`)
  const defaultSort = '-date_created';

  async function read(limit, page, query, sort) {
    const readId = ++lastRead;
    const options = { fields, sort: [sort ?? defaultSort], limit, page, search: query, meta: '*' };
    const res = await api.items('questions').readByQuery(options);
    if (readId === lastRead) items = res;
  }

  $: read(limit, page, query, sort);

  heimdall.listen(({ match }) => {
    if (match('questions')) read(limit, page, query, sort);
  });
</script>

{#if items}
  <div class="wrapper">
    <div class="actions ui-bar">
      <Button on:click={() => goto(`/admin/zapytania/+`)} icon="add">Dodaj</Button>
      <Search {searchParams} {query} />
    </div>

    <Table
      collection="questions"
      itemsCount={items.meta.filter_count}
      items={items.data}
      head={[
        { checkbox: true, icon: 'alert_urgent', label: 'Źródło: Kontakt' },
        { checkbox: true, icon: 'products', label: 'Źródło: Produkt' },
        { label: 'Imię i nazwisko', sort: 'name', float: true },
        { label: 'Email', sort: 'email', float: true },
        { label: 'Telefon', sort: 'phone', float: true },
        { blame: true, label: 'Utworzenie', sort: 'date_created', float: true },
        { blame: true, label: 'Aktualizacja', sort: 'date_updated', float: true },
      ]}
      mapper={($) => ({
        href: `/admin/zapytania/${$.id}`,
        warn: !$.read, // unread: an orange row
        values: [
          $.from_contact,
          $.from_product,
          $.name ?? '',
          $.email,
          $.phone ?? '',
          { user: $.user_created, datetime: $.date_created },
          { user: $.user_updated, datetime: $.date_updated },
        ],
      })}
      {searchParams}
      {sort}
      {defaultSort}
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
