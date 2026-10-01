<script>
  import { goto } from '$app/navigation';

  import api from '$/api';
  import { colorMissing } from '$/colors';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';

  import { globals, colors, companies } from '@/globals';
  import { search as fields } from '%/fields/colors';
  import Button from '@c/Button.svelte';
  import CompanySelect from '@c/CompanySelect.svelte';
  import Table from '@c/table/Table.svelte';
  import { sorted } from '@c/table/utils';
  import Search from '@c/Search.svelte';

  $header = { title: 'Kolory', icon: 'colors' };

  const searchParams = new SearchParams('/admin/kolory');
  $: [limit, page, query, sort] = $searchparams.get(searchParams.pathname).values();

  let items;
  let itemsCount;
  let lastRead = 0; // several reads can be in flight (every change of the url starts one): only the newest counts

  let company = '';
  let lastCompany = '';
  $: if (company !== lastCompany) {
    lastCompany = company;
    setTimeout(() => searchParams.set({ p: 1 }));
  }

  // the whole list (not searched) is sorted here, the producer by its name
  const sortValue = (c, field) =>
    field === 'company.name' ? $companies.find((x) => x.id == c.company)?.name : c[field];

  async function read(limit, page, query, company, sort) {
    const readId = ++lastRead;
    if (query) {
      const filter = company ? { company: { _eq: company } } : undefined;
      const options = {
        fields,
        ...(sort && { sort: [sort] }),
        filter,
        limit,
        page,
        search: query,
        meta: '*',
      };
      const res = await api.items('colors').readByQuery(options);
      if (readId !== lastRead) return;
      items = res.data;
      itemsCount = res.meta.filter_count;
    } else {
      items = sorted(company ? $colors.filter((c) => c.company === company) : $colors, sort, sortValue);
      itemsCount = -1;
    }
  }

  globals.update(companies);
  globals.update(colors);
  $: $companies && $colors && read(limit, page, query, company, sort);
</script>

{#if items}
  <div class="wrapper ui-fill">
    <div class="actions ui-bar">
      <div class="start">
        <Button on:click={() => goto(`/admin/kolory/+`)} icon="add">Dodaj</Button>
        <CompanySelect bind:value={company} />
      </div>
      <Search {searchParams} {query} />
    </div>

    <Table
      collection="colors"
      {itemsCount}
      {items}
      head={[
        { color: true, label: 'Kolor', sort: 'color' },
        { label: 'Nazwa', sort: 'name', float: true },
        { company: true, label: 'Producent', sort: 'company.name', float: true },
        { blame: true, label: 'Utworzenie', sort: 'date_created', float: true },
        { blame: true, label: 'Aktualizacja', sort: 'date_updated', float: true },
      ]}
      mapper={($) => ({
        href: `/admin/kolory/${$.id}`,
        warn: colorMissing($),
        values: [
          $,
          $.name,
          $companies.find((c) => c.id == $.company).name,
          { user: $.user_created, datetime: $.date_created },
          { user: $.user_updated, datetime: $.date_updated },
        ],
      })}
      {searchParams}
      scrollKey={[query, company]}
      {sort}
      {limit}
      {page} />
  </div>
{/if}
<slot />

<style>
  .start {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
