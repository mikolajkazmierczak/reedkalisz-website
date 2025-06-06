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
  $: [limit, page, query] = $searchparams.get(searchParams.pathname).values();

  let items;

  async function read(limit, page, query) {
    const options = { fields, sort: ['-date_created'], limit, page, search: query, meta: '*' };
    items = await api.items('questions').readByQuery(options);
  }

  $: read(limit, page, query);

  heimdall.listen(({ match }) => {
    if (match('questions')) read(limit, page, query);
  });
</script>

{#if items}
  <div class="wrapper">
    <div class="actions">
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
        { checkbox: true, icon: 'attach', label: 'Zawiera załącznik' },
        { thin: true, label: 'Spam' },
        { id: true, label: 'ID' },
        { label: 'Imię i nazwisko' },
        { label: 'Email' },
        { label: 'Telefon' },
        { blame: true, label: 'Utworzenie' },
        { blame: true, label: 'Aktualizacja' }
      ]}
      mapper={$ => ({
        href: `/admin/zapytania/${$.id}`,
        values: [
          $.from_contact,
          $.from_product,
          !!$.file,
          $.spam_chance + '%',
          $.id,
          $.name ?? '',
          $.email,
          $.phone ?? '',
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
