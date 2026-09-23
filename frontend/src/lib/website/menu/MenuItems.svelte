<script>
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
  /** Toggle branches open in place (phone menu) instead of navigating. */
  export let expandable = false;
  /** Open state per item id; unset follows the current page. */
  export let expanded = {};
  addLinks(items);

  const lvl0 = (items[0]?._meta.depth ?? 0) === 0;
</script>

<ul class="menu" class:lvl0 class:expandable>
  {#each items as { id, href, name, children } (id)}
    {@const childActive = deepFindItemByCategorySlug(children, $page.params.slug)}
    {@const exact = href === $page.url.pathname}
    {@const active = exact || childActive}
    {@const open = expandable ? (expanded[id] ?? !!active) : !!active}
    <li>
      <div class="row">
        <a {href} class="item" class:active class:exact aria-current={exact ? 'page' : undefined}>
          {name}
        </a>
        {#if expandable && children?.length}
          <button
            class="toggle"
            type="button"
            aria-expanded={open}
            aria-label="{open ? 'Zwiń' : 'Rozwiń'}: {name}"
            on:click={() => (expanded[id] = !open)}>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              {#if !open}<path d="M8 2v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />{/if}
            </svg>
          </button>
        {/if}
      </div>
      {#if children?.length && open}
        <svelte:self items={children} {expandable} bind:expanded />
      {/if}
    </li>
  {/each}
</ul>

<style>
  .menu {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .menu:not(.lvl0) {
    padding-left: var(--sp-3);
    border-left: 1px solid var(--border);
  }

  .item {
    display: block;
    padding: 0.3125rem 0;
    color: var(--ink-600);
    font-size: var(--fs-sm);
    line-height: 1.35;
  }
  .item:hover {
    color: var(--red);
  }
  .item.active {
    color: var(--ink);
    font-weight: 600;
  }
  .item.exact {
    color: var(--red);
    font-weight: 700;
  }

  /* Long-press opens the link menu, not a selection. */
  .row {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    -webkit-user-select: none;
    user-select: none;
  }
  .row > .item {
    flex: 1 1 auto;
    min-width: 0;
  }
  .lvl0 > li > .row {
    border-bottom: 1px solid var(--border);
  }
  .lvl0 > li > .row > .item {
    padding: var(--sp-2) 0;
    font-size: var(--fs-body);
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.01em;
  }
  .lvl0 > li > .row > .item:hover,
  .lvl0 > li > .row > .item.exact {
    color: var(--red);
  }

  /* Expandable (mobile): thumb-sized rows and a toggle on every branch */
  .toggle {
    flex: none;
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    border-radius: var(--r-pill);
    background-color: rgba(17, 17, 16, 0.06);
    color: var(--ink);
    cursor: pointer;
    transition: background-color var(--dur-fast) var(--ease);
  }
  .toggle:hover {
    background-color: rgba(17, 17, 16, 0.12);
  }
  .toggle[aria-expanded='true'] {
    background-color: var(--ink);
    color: #fff;
  }
  .toggle svg {
    width: 0.75rem;
    height: 0.75rem;
  }
  .expandable .item {
    padding-block: 0.625rem;
    font-size: var(--fs-body);
  }
  .expandable.lvl0 > li > .row > .item {
    padding-block: var(--sp-3);
    font-size: 1.125rem;
  }
  .expandable:not(.lvl0) {
    margin-bottom: var(--sp-2);
  }
</style>
