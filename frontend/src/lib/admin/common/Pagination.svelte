<script>
  import { nanoid } from 'nanoid';
  import { range } from '%/utils';
  import Input from '@c/Input.svelte';
  import Icon from '$c/Icon.svelte';

  export let searchParams = null;
  export let limit;
  export let page;

  export let count;

  const limitId = `limit-${nanoid(6)}`; // "Na stronie" labels its list (a click on it opens it)

  const setLimit = (l) => {
    searchParams?.set({ l });
    limit = l;
  };
  const setPage = (p) => {
    searchParams?.set({ p });
    page = p;
  };

  const limits = [1, 5, 15, 25, 50, 100];
  const limitOptions = limits.map((v) => ({ id: v, text: v }));
  let limitValue = limits.includes(limit) ? limit : 50; // (one not on the list: the usual)
  $: limitValue != limit && setLimit(limitValue); // only set if different from the given from above

  $: pagesCount = Math.ceil(count / limit);
  $: page > pagesCount && setPage(1); // reset page on limit change
  const prev = () => setPage(Math.max(1, page - 1));
  const next = () => setPage(Math.min(page + 1, pagesCount || 1));
</script>

<div class="pagination ui-snap">
  <div class="buttons">
    <button class="arrow" aria-label="Poprzednia strona" class:active={page == 1} on:click={prev}>
      <div class="icon"><Icon fill name="arrow_left" dark /></div>
    </button>

    {#if pagesCount <= 11}
      <!-- all template -->
      {#each range(1, pagesCount) as p}
        <button class:active={page === p} on:click={() => setPage(p)}>{p}</button>
      {/each}
    {:else if page <= 6}
      <!-- left template -->
      {#each range(1, 9) as p}
        <button class:active={page === p} on:click={() => setPage(p)}>{p}</button>
      {/each}
      <button class="more" disabled>...</button>
      <button class:active={page === pagesCount} on:click={() => setPage(pagesCount)}>{pagesCount}</button>
    {:else if page > pagesCount - 6}
      <!-- right template -->
      <button class:active={page === 1} on:click={() => setPage(1)}>1</button>
      <button class="more" disabled>...</button>
      {#each range(pagesCount - 8, pagesCount) as p}
        <button class:active={page === p} on:click={() => setPage(p)}>{p}</button>
      {/each}
    {:else}
      <!-- middle template -->
      <button class:active={page === 1} on:click={() => setPage(1)}>1</button>
      <button class="more" disabled>...</button>
      {#each range(page - 3, page + 3) as p}
        <button class:active={page === p} on:click={() => setPage(p)}>{p}</button>
      {/each}
      <button class="more" disabled>...</button>
      <button class:active={page === pagesCount} on:click={() => setPage(pagesCount)}>{pagesCount}</button>
    {/if}

    <button
      class="arrow"
      aria-label="Następna strona"
      class:active={page == pagesCount || pagesCount == 0}
      on:click={next}>
      <div class="icon"><Icon fill name="arrow_right" dark /></div>
    </button>
  </div>

  <div class="limit">
    <label for={limitId}><small>Na stronie</small></label>
    <Input id={limitId} type="select" bind:value={limitValue} options={limitOptions} />
  </div>
</div>

<style>
  .pagination {
    user-select: none;
    align-self: stretch;
    display: flex;
    flex-wrap: wrap; /* the page size under the pages when they don't fit beside it (whole half cells, see onGrid) */
    justify-content: space-between;
    align-items: center;
    gap: var(--quarter) var(--half);
    border-radius: var(--box-radius);
    corner-shape: squircle;
    border: var(--border-light);
    margin-top: calc(var(--page-pad) + 1px); /* (inside its slot, see .ui-on-mat - its left from .ui-snap) */
    padding: var(--bar-pad) var(--box-pad); /* (as a bar: two cells of the mat) */
    background-color: var(--paper);
    box-shadow: var(--shadow);
  }

  /* the pages as one strip of ruled cells, sharing their edges; rounded off only at its ends */
  .buttons {
    display: flex;
  }
  .buttons > :global(*) {
    margin-left: -1px;
    border-radius: 0;
  }
  .buttons > :global(:first-child) {
    margin-left: 0;
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
    corner-shape: squircle;
  }
  .buttons > :global(:last-child) {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    corner-shape: squircle;
  }
  .buttons > :global(.active) {
    position: relative; /* its ink edge over its neighbours' */
  }
  button {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    border: var(--border-light);
    padding: 0.35rem 0.75rem;
    width: 2.5rem;
    height: var(--control);
    font-variant-numeric: tabular-nums;
    background-color: var(--paper-field);
    transition: background-color 0.1s ease;
  }
  button:hover {
    background-color: var(--blue-100);
  }
  /* the page you're on, filled in the ink */
  button.active {
    border-color: var(--navy-700);
    color: var(--light);
    background-color: var(--navy-700);
  }
  .arrow {
    width: 3rem;
  }
  /* a disabled arrow, and the gap in the pages: nothing to point at */
  .arrow.active,
  .more {
    border-color: var(--black-10);
    background-color: var(--grey-100);
  }
  .more {
    pointer-events: none;
  }
  .icon {
    display: grid;
    place-items: center;
    height: 100%;
    width: 100%;
  }

  .limit label {
    cursor: pointer;
  }
  .limit {
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  /* a phone: the pages themselves wrap too, each cell then rounded on its own */
  @media (max-width: 50rem) {
    .buttons {
      flex-wrap: wrap;
      row-gap: 0.25rem;
    }
    .buttons > :global(*) {
      border-radius: var(--border-radius);
      corner-shape: squircle;
    }
  }
</style>
