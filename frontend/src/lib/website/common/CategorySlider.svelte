<script>
  import { onMount } from 'svelte';
  import { page as pageStore } from '$app/stores';

  import api from '$/api';
  import { sliderFilter, fetchSlider } from '#/products/slider';
  import { preloadImages } from '#/products/images';

  import Pagination from '#c/Pagination.svelte';
  import Products from '#/products/Products.svelte';

  export let slug;
  /** Page size until the grid is measured. */
  export let limit = 4;
  export let filterIds = [];
  /** The first page, loaded on the server (see preloadSlider), so it's in the server render. */
  export let preloaded = null;

  $: ({ categoriesTree, categoriesItems } = $pageStore.data);
  $: filter = slug ? sliderFilter(slug, categoriesItems, categoriesTree, filterIds) : null;

  let page = 1;
  /** Measured grid columns, so each page is exactly one row. */
  let cols = null;
  $: pageSize = cols ?? limit;

  /** The page on show; until one is picked (and in SSR), the preloaded first page. */
  let current = null;
  $: shown = current ?? preloaded;
  let box;
  let mounted = false;

  // Pages by filter, size and number. The current one stays up until the next is in, and the page after is
  // always fetched ahead (pictures too), so paging is instant.
  const pages = new Map();
  /** Totals by filter: a count doesn't change from page to page, so it's asked for once. */
  const counts = new Map();
  function load(size, page) {
    const key = JSON.stringify([filter, size, page]);
    if (!pages.has(key)) {
      const filterKey = JSON.stringify(filter);
      const covers = preloaded && (preloaded.products.length >= size || preloaded.products.length >= preloaded.count);
      const request =
        page === 1 && covers
          ? Promise.resolve(preloaded)
          : fetchSlider(api, filter, size, page, counts.get(filterKey) ?? preloaded?.count).then((result) => {
              counts.set(filterKey, result.count);
              preloadImages(result.products);
              return result;
            });
      pages.set(
        key,
        request.catch((err) => (pages.delete(key), Promise.reject(err))),
      );
    }
    return pages.get(key);
  }

  // A string, so an equal recompute (same `cols` measured again, fresh page data) doesn't reload.
  $: key = filter && mounted ? JSON.stringify([filter, pageSize, page]) : null;
  $: if (key) show(pageSize, page);

  let requests = 0;
  async function show(size, page) {
    const request = ++requests;
    try {
      const result = await load(size, page);
      if (request !== requests) return;
      current = result;
      if (page * size < result.count) load(size, page + 1).catch(() => {});
    } catch {
      // keep what's showing; the next click retries
    }
  }

  /* Mirrors the grid in Products.svelte — keep in sync, with the .first rules below. */
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
    cols = columnsFor(w, window.innerWidth);
  }

  onMount(() => {
    measure();
    mounted = true;
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
</script>

{#if filter}
  <div class="wrapper" class:first={page === 1} bind:this={box}>
    <!-- Nothing until there's a page: no empty state flashing. -->
    {#if shown}<Products products={shown.products} />{/if}
    <Pagination limit={pageSize} bind:page count={shown?.count ?? 0} limitLocked hideSingle noSearchParams />
  </div>
{/if}

<style>
  .wrapper {
    container: slider / inline-size;
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
    width: 100%;
  }

  /* The preloaded first page renders before it can be measured: show one row by the grid's track maths.
     Counted "of" cards, since each card's colour tooltips are grid children too. */
  @media (max-width: 34.9375rem) {
    .first :global(.grid > :nth-child(n + 3 of .tile)) {
      display: none;
    }
  }
  @media (min-width: 35rem) and (max-width: 56.1875rem) {
    @container slider (width < 27.25rem) {
      .first :global(.grid > :nth-child(n + 2 of .tile)) {
        display: none;
      }
    }
    @container slider (width < 41.375rem) {
      .first :global(.grid > :nth-child(n + 3 of .tile)) {
        display: none;
      }
    }
    @container slider (width < 55.5rem) {
      .first :global(.grid > :nth-child(n + 4 of .tile)) {
        display: none;
      }
    }
    @container slider (width < 69.625rem) {
      .first :global(.grid > :nth-child(n + 5 of .tile)) {
        display: none;
      }
    }
  }
  @media (min-width: 56.25rem) {
    @container slider (width < 26.25rem) {
      .first :global(.grid > :nth-child(n + 2 of .tile)) {
        display: none;
      }
    }
    @container slider (width < 40rem) {
      .first :global(.grid > :nth-child(n + 3 of .tile)) {
        display: none;
      }
    }
    @container slider (width < 53.75rem) {
      .first :global(.grid > :nth-child(n + 4 of .tile)) {
        display: none;
      }
    }
    @container slider (width < 67.5rem) {
      .first :global(.grid > :nth-child(n + 5 of .tile)) {
        display: none;
      }
    }
    @container slider (width < 81.25rem) {
      .first :global(.grid > :nth-child(n + 6 of .tile)) {
        display: none;
      }
    }
    @container slider (width < 95rem) {
      .first :global(.grid > :nth-child(n + 7 of .tile)) {
        display: none;
      }
    }
    @container slider (width < 108.75rem) {
      .first :global(.grid > :nth-child(n + 8 of .tile)) {
        display: none;
      }
    }
  }
</style>
