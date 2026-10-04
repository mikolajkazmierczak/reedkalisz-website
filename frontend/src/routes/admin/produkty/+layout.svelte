<script>
  import { goto } from '$app/navigation';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';
  import { makeTree, treeGetAllChildrenIDs } from '%/utils';

  import globals, { categories, companies, colors } from '@/globals';
  import { swatch, COLOR_KINDS } from '$/colors';
  import { companyIcon } from '@c/CompanyIcon.svelte';
  import { thumbDeep, thumbFields, productThumb } from '@/thumb';
  import { search as fields } from '%/fields/products';
  import { productFlags } from '@/flags';
  import Button from '@c/Button.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import FlagFilter from '@c/FlagFilter.svelte';
  import { companyOptions } from '@c/CompanySelect.svelte';
  import FilterSelect, { NONE } from '@c/FilterSelect.svelte';
  import Table from '@c/table/Table.svelte';
  import { productCodeWidth } from '@c/table/utils';
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

  // The producers and colours the list is narrowed to (none: all of them; NONE: the products without any), like the
  // flags only while the list is open. A product added meanwhile gets the producer, when there's just one.
  let producers = [];
  let colorIds = [];
  globals.update(companies);
  globals.update(colors);
  let lastChoices = '|'; // (as it is at first: a link's page stays)
  $: if ([producers, colorIds].join('|') !== lastChoices) {
    lastChoices = [producers, colorIds].join('|');
    setTimeout(() => searchParams.set({ p: 1 }));
  }
  $: company = producers.length === 1 && producers[0] !== NONE ? producers[0] : null;
  // the colours of the producers chosen (and the ones chosen already), each with its producer and what it is:
  // "<favicon> PAR · #ff0000" ("wielokolorowy", ...; without a colour yet, the crossed-out swatch)
  $: colorOptions = colorChoices($colors, $companies, producers, colorIds);
  const colorValue = (c) => [COLOR_KINDS.find(([key]) => c[key])?.[1], c.color].filter(Boolean).join(' ');
  function colorChoices(list, companiesList, producers, chosen) {
    const narrowed = producers.filter((p) => p !== NONE);
    return (list ?? [])
      .filter((c) => !narrowed.length || narrowed.includes(c.company) || chosen.includes(c.id))
      .map((c) => {
        const company = companiesList?.find((co) => co.id === c.company);
        return {
          id: c.id,
          text: c.name,
          swatch: swatch(c, null) ?? true,
          note: [company?.name, colorValue(c)].filter(Boolean).join(' · ') || null,
          noteImage: companyIcon(company),
        };
      })
      .sort((a, b) => a.text.localeCompare(b.text, 'pl') || (a.note ?? '').localeCompare(b.note ?? '', 'pl'));
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

  async function read(limit, page, query, category, flags, producers, colorIds, sort) {
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
    // any of the producers chosen (or none)
    const byProducer = () => {
      if (!producers.length) return {};
      const ids = producers.filter((p) => p !== NONE);
      const or = [
        ...(ids.length ? [{ company: { _in: ids.join(',') } }] : []),
        ...(producers.includes(NONE) ? [{ company: { _null: true } }] : []),
      ];
      return { _or: or };
    };
    // a variant in any of the colours chosen (or no variant with a colour)
    const byColor = () => {
      if (!colorIds.length) return {};
      const ids = colorIds.filter((c) => c !== NONE).join(',');
      const or = [
        ...(ids ? [{ storage: { color_first: { _in: ids } } }, { storage: { color_second: { _in: ids } } }] : []),
        ...(colorIds.includes(NONE)
          ? [{ storage: { _none: { _or: [{ color_first: { _nnull: true } }, { color_second: { _nnull: true } }] } } }]
          : []),
      ];
      return { _or: or };
    };
    const parts = [
      inCategory(),
      searching(),
      byProducer(),
      byColor(),
      // (without: false or never set)
      ...flags.map(([key, on]) =>
        on ? { [key]: { _eq: true } } : { _or: [{ [key]: { _eq: false } }, { [key]: { _null: true } }] },
      ),
    ].filter((f) => Object.keys(f).length);
    const filter = parts.length ? { _and: parts } : {};
    const options = {
      fields: [...fields, ...thumbFields],
      deep: thumbDeep,
      ...(sort && { sort: [sort] }),
      filter,
      limit,
      page,
      meta: '*',
    };
    const result = await api.items('products').readByQuery(options);
    if (readId === lastRead) products = result;
  }

  $: $categories && read(limit, page, query, category, activeFlags, producers, colorIds, sort);

  heimdall.listen(({ match }) => {
    if (match('products')) read(limit, page, query, category, activeFlags, producers, colorIds, sort);
  });
</script>

<div class="wrapper ui-fill">
  <Categories {searchParams} {category} />

  {#if products}
    <div class="items ui-fill-col">
      <div class="actions ui-bar">
        <div>
          <span class="add">
            <Button on:click={() => goto(`/admin/produkty/+${addQuery ? `?${addQuery}` : ''}`)} icon="add"
              >Dodaj</Button>
            {#if addHint}<Tooltip><small>Nowy produkt {addHint}</small></Tooltip>{/if}
          </span>
          <FilterSelect
            label="Producent"
            all="Wszyscy"
            none="Brak"
            bind:value={producers}
            options={companyOptions($companies)} />
          <FilterSelect label="Kolor" none="Brak" bind:value={colorIds} options={colorOptions} />
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
          { label: 'Kod', sort: 'code', width: productCodeWidth, float: true },
          { label: 'Nazwa', sort: 'name', float: true, thumb: true },
          { blame: true, label: 'Utworzenie', sort: 'date_created', float: true },
          { blame: true, label: 'Aktualizacja', sort: 'date_updated', float: true },
        ]}
        mapper={($) => ({
          href: `/admin/produkty/${$.slug}`,
          values: [
            ...productFlags.map(({ key }) => $[key]),
            $.code,
            { thumb: productThumb($), text: $.name },
            { user: $.user_created, datetime: $.date_created },
            { user: $.user_updated, datetime: $.date_updated },
          ],
        })}
        {searchParams}
        scrollKey={[query, category, activeFlags, producers, colorIds]}
        {sort}
        {limit}
        {page} />
    </div>
  {/if}
</div>

<slot />

<style>
  /* the categories beside the products, both as tall as the page at most (see .ui-fill) */
  .wrapper {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    gap: var(--page-pad);
  }

  /* its row's tops together (the flags can wrap to more lines than a button is tall): the buttons level with the
     categories' beside it */
  .actions {
    align-items: flex-start;
  }
  .actions > div {
    display: flex;
    gap: 0.5rem;
  }
  /* on a line of their own when there isn't room for them beside the rest */
  .actions > .flags {
    flex: 1 1 22rem;
    flex-wrap: wrap;
    /* one line in a button's middle, two as far apart as its height lets them */
    align-content: center;
    gap: calc(var(--control) - 2rem) 1rem;
    min-height: var(--control);
    line-height: 1rem; /* two lines no taller than a button: the bar stays two cells of the mat (see onGrid) */
  }
  /* a phone: the categories above the products */
  @media (max-width: 50rem) {
    .wrapper {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto;
    }
    .actions > div {
      flex-wrap: wrap;
    }
    .actions > .flags {
      flex-basis: 100%;
    }
  }
</style>
