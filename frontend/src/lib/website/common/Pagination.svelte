<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page as pageStore } from '$app/stores';
  import { range } from '%/utils';
  import Input from '@c/Input.svelte';
  import Icon from '$c/Icon.svelte';

  export let limit;
  export let page;
  export let count;

  export let noSearchParams = false;
  export let limitLocked = false;

  const q = () => {
    const query = $pageStore.url.searchParams.get('q');
    return query ? `&q=${query}` : '';
  };

  const setLimit = l => {
    if (noSearchParams) {
      limit = l;
    } else {
      browser && goto(`?l=${l}&p=1${q()}`);
    }
  };
  const setPage = p => {
    if (noSearchParams) {
      page = p;
    } else {
      browser && goto(`?l=${limit}&p=${p}${q()}`);
    }
  };

  const limits = [25, 50, 100];

  $: selectedLimit = limits.findIndex(l => l === limit);
  $: limitValue = limitLocked ? limit : limits[selectedLimit === -1 ? 0 : selectedLimit];
  $: limitValue !== limit && setLimit(limitValue); // only set if different from the given from above

  $: pagesCount = Math.ceil(count / limit);

  $: page > pagesCount && setPage(1); // reset page on limit change
  const prev = () => setPage(Math.max(1, page - 1));
  const next = () => setPage(Math.min(page + 1, pagesCount || 1));
</script>

<div class="pagination">
  <div class="buttons">
    <button class="arrow" class:inactive={page == 1} on:click={prev}>
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
      <div class="dots">...</div>
      <button class:active={page === pagesCount} on:click={() => setPage(pagesCount)}>{pagesCount}</button>
    {:else if page > pagesCount - 6}
      <!-- right template -->
      <button class:active={page === 1} on:click={() => setPage(1)}>1</button>
      <div class="dots">...</div>
      {#each range(pagesCount - 8, pagesCount) as p}
        <button class:active={page === p} on:click={() => setPage(p)}>{p}</button>
      {/each}
    {:else}
      <!-- middle template -->
      <button class:active={page === 1} on:click={() => setPage(1)}>1</button>
      <div class="dots">...</div>
      {#each range(page - 3, page + 3) as p}
        <button class:active={page === p} on:click={() => setPage(p)}>{p}</button>
      {/each}
      <div class="dots">...</div>
      <button class:active={page === pagesCount} on:click={() => setPage(pagesCount)}>{pagesCount}</button>
    {/if}

    <button class="arrow" class:inactive={page == pagesCount || pagesCount == 0} on:click={next}>
      <div class="icon"><Icon fill name="arrow_right" dark /></div>
    </button>
  </div>

  {#if !limitLocked}
    <div class="limit">
      <small>Na stronie</small>
      <Input type="select" bind:value={selectedLimit} options={limits.map((v, i) => ({ id: i, text: v }))} />
    </div>
  {/if}
</div>

<style>
  .pagination {
    --pagination-height: 2.5rem;
    user-select: none;
    align-self: stretch;
    display: flex;
    justify-content: space-between;
    height: var(--pagination-height);
  }

  .buttons,
  .limit {
    border: 1px solid rgba(0, 0, 0, 0.05);
    height: 100%;
    background-color: var(--white);
  }

  .buttons {
    display: flex;
    align-items: center;
  }
  .buttons * {
    font-size: 1rem;
  }
  button,
  .dots {
    cursor: pointer;
    border: none;
    width: 2.5rem;
    height: 100%;
    outline: none;
    background-color: transparent;
  }
  button:hover {
    z-index: 1;
    outline: 2px solid var(--main);
  }
  button.active {
    z-index: 0;
    background-color: var(--grey);
    outline: none;
  }
  .arrow {
    width: 3rem;
    transition: opacity 0.1s;
  }
  .arrow.inactive {
    opacity: 0.1;
    background-color: var(--light);
    outline: none;
  }
  .dots {
    cursor: default;
    display: grid;
    place-items: center;
    border: none;
    background-color: transparent;
  }
  .dots:hover {
    background-color: inherit;
  }
  .icon {
    display: grid;
    place-items: center;
    height: 50%;
  }

  .limit {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1rem;
  }
</style>
