<script>
  import { onMount, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { page as pageStore } from '$app/stores';

  import api from '$/api';
  import { treeGetAllChildrenIDs } from '%/utils';
  import { fields, enabledFilter, countProducts } from '#/products/fields';

  import Pagination from '#c/Pagination.svelte';
  import Products from '#/products/Products.svelte';

  $: ({ categoriesTree, categoriesItems } = $pageStore.data);

  export let slug;
  /** Fallback page size until the grid is measured. */
  export let limit = 4;
  export let filterIds = [];

  let page = 1;
  let count = 0;

  /** Measured grid columns, so each page is exactly one row. */
  let cols = null;
  $: pageSize = cols ?? limit;

  let products = [];
  let loading = false;
  let box;
  let minHeight = 0;

  $: filter = slug && getFilter(slug, filterIds);

  // Measuring can set the same `cols` again; don't refetch then.
  let lastKey = null;
  $: key = filter ? JSON.stringify([filter, pageSize, page]) : null;
  $: if (key && key !== lastKey) {
    lastKey = key;
    fetchRecommended(pageSize, page);
  }

  /* Mirrors the grid in Products.svelte — keep in sync. It can't be measured: there is no grid before the first fetch. */
  function columnsFor(boxWidth, viewport) {
    // Same rem breakpoints, converted at the reader's font size.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    if (viewport < 35 * rem) return 2;
    const [min, gap] = viewport < 56.25 * rem ? [13.125 * rem, 1 * rem] : [12.5 * rem, 1.25 * rem];
    return Math.max(1, Math.floor((boxWidth + gap) / (min + gap)));
  }

  function measure() {
    if (!box) return;
    const w = box.getBoundingClientRect().width;
    if (!w) return;
    const n = columnsFor(w, window.innerWidth);
    if (n !== cols) cols = n;
  }

  onMount(() => {
    measure();
    let t;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(measure, 150);
    });
    ro.observe(box);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  });

  function getFilter(slug, filterIds) {
    const category = categoriesItems.find((c) => c.slug === slug && c.enabled)?.id;
    if (!category) throw Error('Category not found');
    const getIds = (c) => [c, ...treeGetAllChildrenIDs(categoriesTree, c)];
    let filter = { ...enabledFilter, categories: { category: { _in: getIds(category) } } };
    if (filterIds.length) {
      filter = { ...filter, id: { _nin: filterIds } }; // exclude some products
    }
    return filter;
  }

  async function fetchRecommended(limit, page) {
    // Pin the height so swapping rows doesn't make the page jump.
    if (browser && box) minHeight = box.offsetHeight;
    loading = true;
    try {
      const sort = ['price_min'];
      const [{ data }, total] = await Promise.all([
        api.items('products').readByQuery({ filter, sort, fields, limit, page }),
        countProducts(api, filter),
      ]);
      count = total;
      products = data;
    } finally {
      loading = false;
      // Release only once the new rows are in the DOM.
      if (browser) {
        await tick();
        requestAnimationFrame(() => (minHeight = 0));
      }
    }
  }
</script>

{#if products}
  <div
    class="wrapper"
    class:is-loading={loading}
    bind:this={box}
    style:min-height={minHeight ? `${minHeight}px` : null}>
    <Products {products} />
    <Pagination limit={pageSize} bind:page {count} limitLocked noSearchParams />
  </div>
{/if}

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
    width: 100%;
  }
  .is-loading :global(.tile) {
    animation: tile-glow 900ms var(--ease) infinite alternate;
  }
  @keyframes tile-glow {
    from {
      box-shadow: 0 0 0 0 rgba(191, 4, 23, 0);
    }
    to {
      box-shadow: 0 0 16px 0 rgba(191, 4, 23, 0.3);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .is-loading :global(.tile) {
      animation: none;
      box-shadow: 0 0 14px 0 rgba(191, 4, 23, 0.25);
    }
  }
</style>
