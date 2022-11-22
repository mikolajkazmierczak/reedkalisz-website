<script>
  import { range } from '$/utils';
  import Input from '@c/Input.svelte';
  import Icon from '$c/Icon.svelte';

  export let searchParams = null;
  export let limit;
  export let page;

  export let count;

  const setLimit = l => {
    searchParams?.set({ l });
    limit = l;
  };
  const setPage = p => {
    searchParams?.set({ p });
    page = p;
  };

  const limits = [1, 5, 25, 50, 100];
  let selectedLimit = limits.findIndex(l => l === limit) ?? 0;
  $: limitValue = limits[selectedLimit];
  $: limitValue != limit && setLimit(limitValue); // only set if different from the given from above

  $: pagesCount = Math.ceil(count / limit);
  $: page > pagesCount && setPage(1); // reset page on limit change
  const prev = () => setPage(Math.max(1, page - 1));
  const next = () => setPage(Math.min(page + 1, pagesCount || 1));
</script>

<div class="pagination">
  <div class="buttons">
    <button class="arrow" class:active={page == 1} on:click={prev}>
      <div class="icon"><Icon name="arrow_left" dark /></div>
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
      <div class="more">...</div>
      <button class:active={page === pagesCount} on:click={() => setPage(pagesCount)}>{pagesCount}</button>
    {:else if page > pagesCount - 6}
      <!-- right template -->
      <button class:active={page === 1} on:click={() => setPage(1)}>1</button>
      <button class="more">...</button>
      {#each range(pagesCount - 8, pagesCount) as p}
        <button class:active={page === p} on:click={() => setPage(p)}>{p}</button>
      {/each}
    {:else}
      <!-- middle template -->
      <button class:active={page === 1} on:click={() => setPage(1)}>1</button>
      <button class="more">...</button>
      {#each range(page - 3, page + 3) as p}
        <button class:active={page === p} on:click={() => setPage(p)}>{p}</button>
      {/each}
      <button class="more">...</button>
      <button class:active={page === pagesCount} on:click={() => setPage(pagesCount)}>{pagesCount}</button>
    {/if}

    <button class="arrow" class:active={page == pagesCount || pagesCount == 0} on:click={next}>
      <div class="icon"><Icon name="arrow_right" dark /></div>
    </button>
  </div>

  <div class="limit">
    <small>Na stronie</small>
    <Input type="select" bind:value={selectedLimit} options={limits.map((v, i) => ({ id: i, text: v }))} />
  </div>
</div>

<style>
  .pagination {
    user-select: none;
    align-self: stretch;
    display: flex;
    justify-content: space-between;
    border-radius: var(--border-radius);
    border: var(--border-light);
    margin-top: 1rem;
    padding: 0.5rem;
    background-color: var(--light);
  }

  .buttons {
    display: flex;
    gap: 0.25rem;
  }
  button,
  .more {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--border-radius);
    border: var(--border-light);
    padding: 0.35rem 0.75rem;
    width: 2.5rem;
    height: 2rem;
    background-color: transparent;
    transition: background-color 0.1s ease;
  }
  button:hover {
    background-color: var(--accent-light);
  }
  button.active {
    background-color: var(--primary-white);
  }
  .arrow {
    width: 3rem;
  }
  .arrow.active {
    background-color: var(--accent-white);
  }
  .more {
    cursor: default;
    border: none;
    background-color: transparent;
  }
  .more:hover {
    background-color: inherit;
  }
  .icon {
    display: grid;
    place-items: center;
    height: 100%;
    width: 100%;
  }

  .limit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
</style>
