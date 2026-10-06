<script>
  import { natural } from '%/order';
  import { portal } from '@/portal';
  import { productThumb, scanThumb } from '@/thumb';
  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import Button from '@c/Button.svelte';
  import Thumb from '@c/Thumb.svelte';
  import { scanEntries } from '../company.js';
  import { cloudOf, openApi, openProduct } from '../items.js';

  // A mapping's products (a supplier category's, a labeling code's, a place rule's): their number as a button, in what
  // the mapping does with them - `tone` 'mapped' (grey), 'inherited' (yellow: from the category above), 'unmapped'
  // (red) - and, when they're left out on purpose, a yellow X before it (`ignored`: its tooltip), or a yellow dot when
  // only some below it are (`ignoredBelow`: its tooltip; the X wins). The button opens a list of them: the supplier's
  // cloud (its search), the picture, the name over the code, and at the end ours (open it) or a blank - searchable,
  // shown a hundred at a time as it's scrolled (a category can have over a thousand).
  export let company;
  export let items = []; // the scan's products
  export let done = null; // how many of them are dealt with: "done / all", the total fainter (a parent category's)
  export let tone = 'mapped';
  export let ignored = null;
  export let ignoredBelow = null;
  export let title = ''; // over the list: whose products they are

  const GAP = 6; // between the button and the list
  const EDGE = 8; // from the window's edges
  const STEP = 100;

  let anchor;
  let list;
  let place = null; // where the list is, while it's open
  let query = '';
  let shown = STEP;

  $: sorted = place ? [...items].sort((a, b) => natural(a.code, b.code) || natural(a.name, b.name)) : [];
  $: q = query.trim().toLowerCase();
  $: found = q ? sorted.filter((i) => `${i.code ?? ''} ${nameOf(i, $scanEntries)}`.toLowerCase().includes(q)) : sorted;

  // ours when imported, else the scan's (an entry that isn't ours is the scan's product)
  const nameOf = (item, entries) => entries?.get(item)?.name ?? item.name ?? '';

  function open() {
    const r = anchor.getBoundingClientRect();
    const below = innerHeight - r.bottom - GAP - EDGE;
    const above = r.top - GAP - EDGE;
    const up = below < 280 && above > below;
    const width = Math.min(26 * parseFloat(getComputedStyle(document.documentElement).fontSize), innerWidth - 2 * EDGE);
    place = {
      left: Math.max(EDGE, Math.min(r.left, innerWidth - EDGE - width)),
      top: up ? null : r.bottom + GAP,
      bottom: up ? innerHeight - r.top + GAP : null,
      width,
      maxHeight: Math.min(up ? above : below, 32 * 16),
    };
    query = '';
    shown = STEP;
  }
  function close() {
    place = null;
  }

  // the window listened to only while the list is open (a tab has a button per row): the page scrolled anyway (the
  // keyboard, a script) - the list would stay behind, so it closes; Escape closes it, back to the button
  function floating(node) {
    node.querySelector('input')?.focus();
    const scrolled = (e) => !node.contains(e.target) && close();
    const key = (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      close();
      anchor.querySelector('button')?.focus();
    };
    addEventListener('scroll', scrolled, true);
    addEventListener('resize', close);
    addEventListener('keydown', key);
    return {
      destroy() {
        removeEventListener('scroll', scrolled, true);
        removeEventListener('resize', close);
        removeEventListener('keydown', key);
      },
    };
  }
  // while it's open the page doesn't scroll (a wheel beside the list, or over one too short to scroll, would carry the
  // button away from it); only the list does, not past its ends
  function wheel(e) {
    if (!list?.contains(e.target) || list.scrollHeight <= list.clientHeight) e.preventDefault();
  }

  // the next hundred once the end of the list comes into view
  function more(node) {
    const seen = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) shown += STEP;
    });
    seen.observe(node);
    return { destroy: () => seen.disconnect() };
  }
</script>

<span class="products">
  {#if ignored || ignoredBelow}
    <span class="ignored">
      {#if ignored}
        <Icon width="0.85rem" height="0.85rem" name="close" color="var(--yellow-500)" strokeWidth={1} />
      {:else}
        <span class="dot" />
      {/if}
      <Tooltip><small class="tip">{ignored ?? ignoredBelow}</small></Tooltip>
    </span>
  {/if}
  <span class="count" bind:this={anchor}>
    <Button
      size="sm"
      secondary={tone === 'mapped'}
      tone={tone === 'inherited' ? 'note' : tone === 'unmapped' ? 'danger' : null}
      disabled={!items.length && tone !== 'unmapped'}
      title={items.length ? 'Pokaż produkty' : null}
      on:click={() => (place ? close() : open())}>
      {#if done != null}{done} <span class="of">/ {items.length}</span>{:else}{items.length}{/if}
    </Button>
  </span>
</span>

{#if place}
  <!-- a click beside the list only closes it -->
  <div
    class="backdrop"
    role="presentation"
    use:portal
    on:click={close}
    on:wheel|nonpassive|preventDefault
    on:touchmove|nonpassive|preventDefault />
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="box"
    role="dialog"
    aria-label={title}
    use:portal
    use:floating
    on:wheel|nonpassive={wheel}
    style:left="{place.left}px"
    style:top={place.top != null ? `${place.top}px` : null}
    style:bottom={place.bottom != null ? `${place.bottom}px` : null}
    style:width="{place.width}px"
    style:max-height="{place.maxHeight}px">
    <div class="top">
      {#if title}<span class="ui-stat-label title">{title}</span>{/if}
      <input
        class="search"
        type="text"
        placeholder="Szukaj..."
        aria-label="Szukaj"
        bind:value={query}
        on:input={() => (shown = STEP)} />
    </div>
    <div class="list" bind:this={list}>
      {#each found.slice(0, shown) as item (item)}
        {@const entry = $scanEntries?.get(item)}
        {@const ours = entry?._db ? entry : null}
        {@const name = entry?.name ?? item.name ?? ''}
        {@const cloud = entry ? cloudOf(entry) : null}
        <div class="row">
          <span>
            {#if $scanEntries}
              <Button
                size="sm"
                icon={cloud?.icon ?? 'cloud'}
                tone={cloud?.tone ?? 'success'}
                title={cloud?.title ?? 'Dostępny'}
                on:click={() => openApi(company, item.code, item.name)} />
            {/if}
          </span>
          <Thumb file={ours ? productThumb(ours) : null} src={ours ? null : scanThumb(item)} size="2rem" zoom blank />
          <span class="text">
            <span class="name" title={name}>{name}</span>
            <small class="code">{item.code ?? '—'}</small>
          </span>
          <span>
            {#if ours}
              <Button
                size="sm"
                tone="info"
                icon="cube"
                title="Otwórz zaimportowany produkt"
                on:click={() => openProduct(ours)} />
            {/if}
          </span>
        </div>
      {:else}
        <p class="empty">{q ? `Brak produktów pasujących do „${query}”.` : 'Brak produktów.'}</p>
      {/each}
      {#if found.length > shown}<div class="more" use:more />{/if}
    </div>
  </div>
{/if}

<style>
  .products {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.25rem;
  }
  .count :global(button) {
    min-width: 2.5rem;
    font-variant-numeric: tabular-nums;
  }
  /* fainter on any tone, as the bars' totals are (see Panel) */
  .of {
    opacity: 0.55;
  }
  .ignored {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.1rem;
    height: 1.1rem;
  }
  /* in the X's place, centred */
  .dot {
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 50%;
    background-color: var(--yellow-500);
  }
  /* a line per category in the dot's */
  .tip {
    white-space: pre-line;
  }
  /* as a select's list (see Select) */
  .backdrop {
    z-index: 1600;
    position: fixed;
    inset: 0;
  }
  .box {
    z-index: 1601;
    position: fixed;
    display: flex;
    flex-direction: column;
    border: solid 1px var(--edge);
    border-radius: var(--box-radius);
    corner-shape: squircle;
    background-color: var(--paper-field);
    box-shadow: var(--shadow-lifted);
    overflow: hidden;
  }
  .top {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0.5rem 0.35rem;
    border-bottom: var(--border-light);
  }
  .title {
    overflow: hidden;
    padding-inline: 0.15rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .search {
    height: 1.9rem;
    padding: 0.25rem 0.5rem;
    border: solid 1px var(--edge);
    border-radius: var(--field-radius);
    corner-shape: squircle;
    font-size: 0.85rem;
  }
  .list {
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0.25rem;
  }
  /* the cloud, the picture, the name over the code, ours (or its room) */
  .row {
    display: grid;
    grid-template-columns: 1.5rem 2rem minmax(0, 1fr) 1.5rem;
    align-items: center;
    gap: 0.4rem;
    padding: 0.2rem 0.25rem;
    border-radius: var(--button-radius-small);
  }
  .row:hover {
    background-color: var(--black-6);
  }
  .text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.2;
  }
  .name {
    overflow: hidden;
    font-size: 0.85rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .code {
    color: var(--grey-500);
    font-size: 0.75rem;
  }
  .empty {
    margin: 0.5rem;
    color: var(--grey-500);
    font-size: 0.85rem;
  }
  .more {
    height: 1px;
  }
</style>
