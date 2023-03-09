<script>
  import { page } from '$app/stores';
  import { slide, fly } from 'svelte/transition';

  import { addLinks } from '#/utils';

  export let items;
  addLinks(items);

  const depth = items[0]._meta.depth;
  const lvl0 = depth == 0;
  const lvl1 = depth == 1;

  function deepFindItemByCategorySlug(items, slug) {
    if (!items) return;
    for (const item of items) {
      if (item.category.slug === slug) return item;
      const child = deepFindItemByCategorySlug(item.children, slug);
      if (child) return child;
    }
  }
</script>

<!-- out:slide={{ duration: 150, delay: 150 }} -->
<!-- out:fly={{ y: -15, duration: 150 }} -->
<div class="wrapper" in:slide={{ duration: 300 }} style:padding-left={20 * (depth - 1) + 'px'} class:lvl0 class:lvl1>
  {#each items as { id, href, name }, i (id)}
    {@const children = items.find(c => c.id === id)?.children}
    {@const childActive = deepFindItemByCategorySlug(children, $page.params.slug)}
    {@const active = href === $page.url.pathname || childActive}
    <a {href} class:active in:fly={{ y: -15, duration: 300, delay: 50 * i }}>
      {name}
    </a>
    {#if children?.length && (active || lvl0)}
      <div class="submenu">
        <svelte:self items={children} />
      </div>
    {/if}
  {/each}
</div>

<style>
  .wrapper,
  .submenu {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .submenu {
    border-left: 2px solid var(--main-1);
  }
  .wrapper.lvl0 {
    gap: 1.5rem;
  }
  .lvl0 > .submenu {
    margin-top: -0.75rem;
    border-left: none;
  }

  a {
    cursor: pointer;
    outline: none;
    border: none;
    background-color: var(--white);
    font-size: 1.15rem;
    color: var(--main);
    text-align: left;
    text-decoration: none;
    white-space: nowrap;
  }
  a:hover {
    /* text-decoration: underline; */
    font-style: italic;
  }
  a.active {
    /* text-decoration: underline; */
    background-color: var(--main-1);
    padding: 0 0.25rem;
  }
  .lvl0 > a {
    font-size: 1.3rem;
    font-weight: 600;
  }
</style>
