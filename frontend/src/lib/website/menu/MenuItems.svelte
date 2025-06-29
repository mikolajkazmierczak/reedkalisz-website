<script>
  import { slide, fly } from 'svelte/transition';

  import { page } from '$app/stores';
  import { addLinks } from '#/utils';

  function deepFindItemByCategorySlug(items, slug) {
    if (!items) return;
    for (const item of items) {
      if (item.category.slug === slug) return item;
      const child = deepFindItemByCategorySlug(item.children, slug);
      if (child) return child;
    }
  }

  export let items;
  addLinks(items);

  const depth = items[0]._meta.depth;
  const lvl0 = depth == 0;
  const lvl1 = depth == 1;
</script>

<!-- out:slide={{ duration: 150, delay: 150 }} -->
<!-- out:fly={{ y: -15, duration: 150 }} -->
<div class="menu" class:lvl0 class:lvl1 in:slide={{ duration: 300 }}>
  {#each items as { id, href, name }, i (id)}
    {@const children = items.find(c => c.id === id)?.children}
    {@const childActive = deepFindItemByCategorySlug(children, $page.params.slug)}
    {@const active = href === $page.url.pathname || childActive}
    <a {href} class="item" class:active in:fly={{ y: -15, duration: 300, delay: 50 * i }}>
      {name}
    </a>
    {#if children?.length && active}
      <svelte:self items={children} />
    {/if}
  {/each}
</div>

<style>
  :root {
    --bg-hover: var(--main-1);
    --bg-active: var(--main);
  }
  .menu {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    border-left: 2px solid var(--bg-active);
    padding-left: 1rem;
  }
  .lvl0,
  .lvl1 {
    padding-left: 0;
    border-left: none;
  }
  .lvl0 {
    gap: 1.4rem;
  }
  .lvl1 {
    margin-top: -0.75rem;
  }

  .item {
    cursor: pointer;
    outline: none;
    border: none;
    background-color: rgba(0, 0, 0, 0);
    font-size: 1.1rem;
    color: var(--text);
    text-align: left;
    text-decoration: none;
    white-space: nowrap;
    transition:
      padding 200ms,
      background-color 100ms;
  }
  .item:hover {
    background-color: var(--bg-hover);
    padding: 0 0.5rem;
  }
  .item.active {
    background-color: var(--bg-active);
    padding: 0 0.5rem;
    color: #fff;
    transition: padding 200ms;
  }
  .lvl0 > .item {
    font-size: 1.3rem;
    font-weight: 600;
  }
</style>
