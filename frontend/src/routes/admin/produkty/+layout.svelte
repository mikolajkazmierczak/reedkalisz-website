<script>
  import { goto } from '$app/navigation';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';
  import { makeTree, treeGetAllChildrenIDs } from '%/utils';

  import globals, { categories, companies } from '@/globals';
  import { search as fields } from '%/fields/products';
  import { productFlags } from '@/flags';
  import Button from '@c/Button.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import FlagFilter from '@c/FlagFilter.svelte';
  import CompanySelect from '@c/CompanySelect.svelte';
  import Table from '@c/table/Table.svelte';
  import Search from '@c/Search.svelte';
  import Categories from './Categories.svelte';

  $header = { title: 'Produkty', icon: 'products' };

  const searchParams = new SearchParams('/admin/produkty');
  $: [limit, page, query, category, sort] = $searchparams.get(searchParams.pathname).values();

  // The flags the list is narrowed to (all of them at once): true for the products with it, false for those without,
  // null for either. Not in the url: they only last while the list is open, so they can't be forgotten and leave an
  // empty list the next time.
  let flagFilters = Object.fromEntries(productFlags.map(({ key }) => [key, null]));
  $: activeFlags = Object.entries(flagFilters).filter(([, on]) => on !== null);
  // back to the first page when they change (outside of Svelte's update: a store set in a `$:` doesn't reach them)
  let lastFlags = '';
  $: if (activeFlags.join() !== lastFlags) {
    lastFlags = activeFlags.join();
    setTimeout(() => searchParams.set({ p: 1 }));
  }

  // The producer the list is narrowed to ('' for all), like the flags only while the list is open. A product added
  // meanwhile gets it too.
  let company = '';
  globals.update(companies);
  let lastCompany = '';
  $: if (company !== lastCompany) {
    lastCompany = company;
    setTimeout(() => searchParams.set({ p: 1 }));
  }
  // what a product added now gets from the list's choices (not the flags)
  $: addHint = [
    category != null && category != -1 && `w kategorii ${$categories?.find((c) => c.id == category)?.name}`,
    company && `producenta ${$companies?.find((c) => c.id == company)?.name}`,
  ]
    .filter(Boolean)
    .join(', ');
  $: addQuery = [category != null && category != -1 && `c=${category}`, company && `producent=${company}`]
    .filter(Boolean)
    .join('&');

  // back to the first page when the category changes (not on the first run: a link keeps its page)
  let lastCategory;
  $: if (category !== lastCategory) {
    if (lastCategory !== undefined) setTimeout(() => searchParams.set({ p: 1 }));
    lastCategory = category;
  }

  let products;
  let lastRead = 0; // several reads can be in flight (every change of the url starts one): only the newest counts

  async function read(limit, page, query, category, flags, company, sort) {
    const readId = ++lastRead;
    if (category !== null && category !== -1 && !$categories.find((c) => c.id == category)) {
      // TODO: doesn't work after deleting a category you're in
      searchParams.set({ c: null });
      return;
    }

    // a category and everything under it, as on the website (a CSV, see categoryFilter)
    const inCategory = () => {
      if (category == -1) return { categories: { _null: true } };
      if (category == null) return {};
      const ids = [category, ...treeGetAllChildrenIDs(makeTree($categories), category)];
      return { categories: { category: { _in: ids.join(',') } } };
    };
    // the search looks in the name, code and description, and in the codes of the variants ('R123-10')
    const q = String(query ?? '').trim(); // a number when the url has only digits (?q=12345)
    const searching = () =>
      q
        ? {
            _or: [
              { name: { _icontains: q } },
              { code: { _icontains: q } },
              { description: { _icontains: q } },
              { storage: { api_color_code: { _icontains: q } } },
            ],
          }
        : {};
    const parts = [
      inCategory(),
      searching(),
      company ? { company: { _eq: company } } : {},
      // (without: false or never set)
      ...flags.map(([key, on]) =>
        on ? { [key]: { _eq: true } } : { _or: [{ [key]: { _eq: false } }, { [key]: { _null: true } }] },
      ),
    ].filter((f) => Object.keys(f).length);
    const filter = parts.length ? { _and: parts } : {};
    const options = {
      fields,
      ...(sort && { sort: [sort] }),
      filter,
      limit,
      page,
      meta: '*',
    };
    const result = await api.items('products').readByQuery(options);
    if (readId === lastRead) products = result;
  }

  $: $categories && read(limit, page, query, category, activeFlags, company, sort);

  heimdall.listen(({ match }) => {
    if (match('products')) read(limit, page, query, category, activeFlags, company, sort);
  });
</script>

<div class="wrapper">
  <Categories {searchParams} {category} />

  {#if products}
    <div class="items">
      <div class="actions ui-bar">
        <div>
          <span class="add">
            <Button on:click={() => goto(`/admin/produkty/+${addQuery ? `?${addQuery}` : ''}`)} icon="add"
              >Dodaj</Button>
            {#if addHint}<Tooltip><small>Nowy produkt {addHint}</small></Tooltip>{/if}
          </span>
          <CompanySelect bind:value={company} />
        </div>
        <div class="flags">
          {#each productFlags as { key, label } (key)}
            <FlagFilter {label} bind:value={flagFilters[key]} />
          {/each}
        </div>
        <Search {searchParams} {query} />
      </div>

      <Table
        collection="products"
        itemsCount={products.meta.filter_count}
        items={products.data}
        head={[
          ...productFlags.map(({ icon, label }) => ({ checkbox: true, icon, label })),
          { label: 'Kod', sort: 'code', width: 'minmax(6rem, 0.8fr)', float: true },
          { label: 'Nazwa', sort: 'name', float: true },
          { blame: true, label: 'Utworzenie', sort: 'date_created', float: true },
          { blame: true, label: 'Aktualizacja', sort: 'date_updated', float: true },
        ]}
        mapper={($) => ({
          href: `/admin/produkty/${$.slug}`,
          values: [
            ...productFlags.map(({ key }) => $[key]),
            $.code,
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
</div>

<slot />

<style>
  .wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }

  .items {
    overflow-x: auto;
  }
  .actions > div {
    display: flex;
    gap: 0.5rem;
  }
  .actions > .flags {
    flex: 1;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
  }
  /* a phone: the categories above the products */
  @media (max-width: 50rem) {
    .wrapper {
      grid-template-columns: minmax(0, 1fr);
    }
    .actions > div {
      flex-wrap: wrap;
    }
    .actions > .flags {
      flex-basis: 100%;
    }
  }
</style>
