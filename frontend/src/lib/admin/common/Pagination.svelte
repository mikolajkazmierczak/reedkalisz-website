<script>
  import { range } from '$lib/utils';
  import Input from '$lib/admin/input/Input.svelte';
  import Icon from '$lib/common/Icon.svelte';

  export let limit = 5;
  export let page;
  export let total;

  const limits = [1, 5, 25, 50, 100];
  let selectedLimit = limits.findIndex(l => l === limit) ?? 0;
  $: if (selectedLimit !== null) {
    limit = limits[selectedLimit];
  }

  $: pagesCount = Math.ceil(total / limit);
</script>

<div class="pagination">
  <div class="buttons">
    <div class="button prev" class:active={page == 1} on:click={() => (page = Math.max(1, page - 1))}>
      <div class="icon">
        <Icon name="arrow_left" dark />
      </div>
    </div>

    {#if pagesCount <= 11}
      <!-- all template -->
      {#each range(1, pagesCount) as p}
        <div role="button" class="button" class:active={page === p} on:click={() => (page = p)}>{p}</div>
      {/each}
    {:else if page <= 6}
      <!-- left template -->
      {#each range(1, 9) as p}
        <div role="button" class="button" class:active={page === p} on:click={() => (page = p)}>{p}</div>
      {/each}
      <div class="button more">...</div>
      <div role="button" class="button" class:active={page === pagesCount} on:click={() => (page = pagesCount)}>
        {pagesCount}
      </div>
    {:else if page > pagesCount - 6}
      <!-- right template -->
      <div role="button" class="button" class:active={page === 1} on:click={() => (page = 1)}>1</div>
      <div class="button more">...</div>
      {#each range(pagesCount - 8, pagesCount) as p}
        <div role="button" class="button" class:active={page === p} on:click={() => (page = p)}>{p}</div>
      {/each}
    {:else}
      <!-- middle template -->
      <div role="button" class="button" class:active={page === 1} on:click={() => (page = 1)}>1</div>
      <div class="button more">...</div>
      {#each range(page - 3, page + 3) as p}
        <div role="button" class="button" class:active={page === p} on:click={() => (page = p)}>{p}</div>
      {/each}
      <div class="button more">...</div>
      <div role="button" class="button" class:active={page === pagesCount} on:click={() => (page = pagesCount)}>
        {pagesCount}
      </div>
    {/if}

    <div
      class="button next"
      class:active={page == pagesCount}
      on:click={() => (page = Math.min(page + 1, pagesCount || 1))}
    >
      <div class="icon">
        <Icon name="arrow_right" dark />
      </div>
    </div>
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
  .button {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--border-radius);
    border: var(--border-light);
    padding: 0.35rem 0.75rem;
    width: 2.5rem;
    height: 2rem;
  }
  .button:hover {
    background-color: var(--accent-light);
  }
  .button.active {
    background-color: var(--primary-white);
  }
  .prev,
  .next {
    width: 3rem;
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
