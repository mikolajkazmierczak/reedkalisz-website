<script>
  import { goto } from '$app/navigation';

  import api from '$/api';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';

  import { globals, commercialDetails } from '@/globals';
  import { search as fields } from '%/fields/commercial_details';
  import Button from '@c/Button.svelte';
  import Table from '@c/table/Table.svelte';
  import { sorted } from '@c/table/utils';
  import Search from '@c/Search.svelte';

  $header = { title: 'Paragrafy', icon: 'commercial_details' }; // the commercial_details collection

  const searchParams = new SearchParams('/admin/paragrafy');
  $: [limit, page, query, sort] = $searchparams.get(searchParams.pathname).values();

  let items;
  let itemsCount;
  let lastRead = 0; // several reads can be in flight (every change of the url starts one): only the newest counts

  async function read(limit, page, query, sort) {
    const readId = ++lastRead;
    if (query) {
      const options = {
        fields,
        ...(sort && { sort: [sort] }),
        limit,
        page,
        search: query,
        meta: '*',
      };
      const res = await api.items('commercial_details').readByQuery(options);
      if (readId !== lastRead) return;
      items = res.data;
      itemsCount = res.meta.filter_count;
    } else {
      items = sorted($commercialDetails, sort);
      itemsCount = -1;
    }
  }

  globals.update(commercialDetails);
  $: $commercialDetails && read(limit, page, query, sort);
</script>

{#if items}
  <div class="wrapper">
    <div class="actions ui-bar">
      <Button on:click={() => goto(`/admin/paragrafy/+`)} icon="add">Dodaj</Button>
      <Search {searchParams} {query} />
    </div>

    <Table
      collection="commercial_details"
      {itemsCount}
      {items}
      head={[
        { label: 'Nazwa', sort: 'name', float: true },
        { blame: true, label: 'Utworzenie', sort: 'date_created', float: true },
        { blame: true, label: 'Aktualizacja', sort: 'date_updated', float: true },
      ]}
      mapper={($) => ({
        href: `/admin/paragrafy/${$.id}`,
        values: [
          $.name,
          { user: $.user_created, datetime: $.date_created },
          { user: $.user_updated, datetime: $.date_updated },
        ],
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
