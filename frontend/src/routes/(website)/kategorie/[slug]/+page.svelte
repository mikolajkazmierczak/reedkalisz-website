<script>
  import { marked } from 'marked';
  import { page } from '$app/stores';
  import { tick } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { treeGetItem, treeGetItemsFromPath } from '%/utils';
  import Pagination from '#c/Pagination.svelte';
  import SideRail from '#/shell/SideRail.svelte';
  import Products from '#/products/Products.svelte';
  import { plural } from '#/utils';
  import { describe, jsonLd, breadcrumbList } from '#/seo';

  export let data;

  $: query = $page.url.searchParams.get('q');
  $: title = data.category?.name ?? (query ? `Wyniki: ${query}` : 'Cały katalog');

  $: breadcrumbs = getBreadcrumbs(data.category, $page.data.categoriesTree);

  function getBreadcrumbs(category, tree) {
    if (!category || !tree) return [];
    const item = treeGetItem(tree, category.id);
    if (!item) return [];
    return treeGetItemsFromPath(tree, item._meta.path).map(({ name, slug }) => ({ name, slug }));
  }

  // Long descriptions are clamped and open on request.
  let descOpen = false;
  let descOverflows = false;
  $: (data.category, (descOpen = false));

  /* An action, not onMount: the element and its text change between categories. Skipped while open. */
  function clamp(node) {
    const check = () => {
      if (!descOpen) descOverflows = node.scrollHeight > node.clientHeight + 4;
    };
    const ro = new ResizeObserver(check);
    ro.observe(node);
    check();
    return {
      update: () => tick().then(check),
      destroy: () => ro.disconnect(),
    };
  }

  const sorts = [
    { id: 'price', label: 'Cena rosnąco' },
    { id: 'price-desc', label: 'Cena malejąco' },
    { id: 'name', label: 'Nazwa A–Z' },
    { id: 'newest', label: 'Najnowsze' },
  ];

  function setSort(value) {
    const url = new URL($page.url);
    url.searchParams.set('s', value);
    url.searchParams.delete('p');
    browser && goto(url.pathname + url.search);
  }

  $: countLabel = `${data.count} ${plural(data.count, ['produkt', 'produkty', 'produktów'])}`;

  $: metaDescription =
    describe(data.category?.description) ||
    `${title} — ${countLabel} w katalogu REED Kalisz. Ceny ze znakowaniem, wycena na zapytanie.`;
</script>

<svelte:head>
  <title>{title}{data.page > 1 ? ` — strona ${data.page}` : ''} | REED Kalisz</title>
  <meta name="description" content={metaDescription} />
  <!-- Don't index search results. -->
  {#if query}<meta name="robots" content="noindex, follow" />{/if}
  {#if breadcrumbs.length}
    {@html jsonLd(breadcrumbList(breadcrumbs.map(({ name, slug }) => ({ name, path: `/kategorie/${slug}` }))))}
  {/if}
</svelte:head>

<div class="shell">
  <SideRail items={data.menus.side} />

  <div class="shell__main">
    <div class="wrap content">
      <div class="intro">
        <div class="crumbs-slot">
          {#if breadcrumbs.length > 1}
            <nav class="crumbs label" aria-label="Ścieżka nawigacji">
              {#each breadcrumbs as { name, slug }, i}
                {#if i > 0}<span aria-hidden="true">/</span>{/if}
                <a
                  href={`/kategorie/${slug}`}
                  class:last={i === breadcrumbs.length - 1}
                  aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}>{name}</a>
              {/each}
            </nav>
          {/if}
        </div>

        <header class="head">
          <h1 class="head__title">{title}</h1>
          {#if data.category?.description}
            <div class="desc">
              <div
                class="prose head__desc"
                id="category-desc"
                class:open={descOpen}
                use:clamp={data.category.description}>
                {@html marked.parse(data.category.description)}
              </div>
              {#if descOverflows}
                <button
                  class="desc__more"
                  type="button"
                  aria-expanded={descOpen}
                  aria-controls="category-desc"
                  on:click={() => (descOpen = !descOpen)}>
                  {descOpen ? 'Zwiń opis' : 'Czytaj dalej'}
                </button>
              {/if}
            </div>
          {/if}
        </header>

        <div class="toolbar">
          {#if data.products?.length}
            <div class="toolbar__pager">
              <Pagination limit={data.limit} page={data.page} count={data.count} limitLocked label="Paginacja — góra" />
            </div>
          {/if}
          <p class="toolbar__count tnum">{countLabel}</p>
          <label class="select toolbar__sort">
            <span class="visually-hidden">Sortuj</span>
            <select value={data.sort} on:change={(e) => setSort(e.currentTarget.value)}>
              {#each sorts as s}
                <option value={s.id}>{s.label}</option>
              {/each}
            </select>
          </label>
        </div>
      </div>

      {#if data.products && data.products.length}
        <Products products={data.products} />
        <div class="pager">
          <Pagination limit={data.limit} page={data.page} count={data.count} />
        </div>
      {:else}
        <div class="empty">
          <h2>
            {#if query}Brak wyników dla „{query}”{:else}Brak produktów w tej kategorii{/if}
          </h2>
          <p>Napisz do nas z nazwą albo kodem — sprowadzamy produkty na zamówienie.</p>
          <a class="btn btn--orange" href="/kontakt">Napisz do nas</a>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* On desktop the toolbar's rule lines up with the foot of the rail's navy contact block. */
  .intro {
    display: flex;
    flex-direction: column;
    margin-bottom: var(--sp-8);
  }
  .content {
    padding-top: var(--sp-5);
    padding-bottom: var(--sp-16);
  }

  /* The trail's space is kept on every category, so the title never moves. */
  .crumbs-slot {
    min-height: 1.75rem;
    margin-bottom: var(--sp-3);
  }

  .crumbs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sp-2);
    min-height: 1.75rem;
  }
  .crumbs a {
    color: var(--ink-400);
  }
  .crumbs a:hover {
    color: var(--red);
  }
  .crumbs a.last {
    color: var(--ink);
  }
  /* Beside the rail: the trail's capitals start level with the logo's top, the title stands on its foot. */
  @media (min-width: 61.25rem) {
    .intro {
      min-height: calc(var(--rail-head) - var(--sp-5));
    }
    .crumbs-slot {
      min-height: calc(var(--title-top) - var(--sp-5));
      margin-bottom: 0;
    }
    .crumbs {
      align-items: flex-start;
      min-height: 0;
    }
    /* trimmed to the capitals, whatever monospace the system has */
    .crumbs > * {
      text-box: trim-both cap alphabetic;
    }
  }

  .head__title {
    font-size: var(--fs-h1);
  }
  .desc {
    margin-top: var(--sp-4);
  }
  .head__desc {
    position: relative;
    max-width: 68ch;
    max-height: 5.5em;
    overflow: hidden;
    font-size: var(--fs-sm);
  }
  .head__desc::after {
    content: '';
    position: absolute;
    inset: auto 0 0;
    height: 2.2em;
    background: linear-gradient(to bottom, rgba(253, 253, 252, 0), var(--paper));
    pointer-events: none;
  }
  .head__desc.open {
    max-height: none;
  }
  .head__desc.open::after {
    display: none;
  }
  .desc__more {
    margin-top: var(--sp-2);
    padding: 0;
    border: none;
    background: none;
    color: var(--red);
    font-family: inherit;
    font-size: var(--fs-sm);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 0.18em;
    cursor: pointer;
  }
  .desc__more:hover {
    color: var(--red-deep);
  }

  /* Wide: one row. Phone: the pager gets its own row. */
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sp-3) var(--sp-5);
    margin-top: auto;
    padding-top: var(--sp-6);
    padding-bottom: var(--sp-3);
    border-bottom: var(--rule);
  }
  .toolbar__sort {
    margin-left: auto;
  }
  @media (max-width: 34.9375rem) {
    .toolbar__pager {
      flex-basis: 100%;
    }
    .toolbar__pager :global(.pg) {
      justify-content: flex-start;
    }
  }
  .toolbar__count {
    color: var(--ink-500);
    font-size: var(--fs-sm);
    font-weight: 600;
  }

  .pager {
    margin-top: var(--sp-8);
    padding-top: var(--sp-5);
    border-top: var(--rule);
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-3);
    padding: var(--sp-12) 0;
  }
  .empty h2 {
    font-size: var(--fs-h3);
  }
  .empty p {
    max-width: 52ch;
    color: var(--ink-500);
    font-size: var(--fs-sm);
  }
  .empty .btn {
    margin-top: var(--sp-2);
  }
</style>
