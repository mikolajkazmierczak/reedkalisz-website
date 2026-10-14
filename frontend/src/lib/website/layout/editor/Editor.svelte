<script>
  import '$/styles/ui-admin-scope.css';

  import { onMount, tick } from 'svelte';
  import Icon from '$c/Icon.svelte';
  import Button from '@c/Button.svelte';
  import Dialog from '@/Dialog.svelte';
  import { ask, guardLeaving } from '@/dialog';
  import globals from '@/globals';
  import { portal } from '@/portal';

  import { modified, selected, actions } from '#/layout/store';
  import { create, newBanner } from '#/layout/utils';
  import { firstFree } from '#/layout/editor/grid';
  import Blocks from '#/layout/editor/Blocks.svelte';
  import Block from '#/layout/editor/Block.svelte';
  import Banner from '#/layout/editor/Banner.svelte';

  // The homepage's editor: a panel over the rail (the page beside it as it is: every change shows on it at once),
  // in the admin's look and with its components (the file library, its selects). A block or a banner is picked on the
  // page or in the panel's list; its settings take the panel. Loaded only once an admin starts editing.
  export let layout; // the page's blocks (bound)
  export let types; // [{ type, label, icon }], every block's
  export let addable; // the types a block can be added of
  export let categories; // [{ id: slug, text }]
  export let save; // async: saves the layout and closes the editor (when it can't, it says so and leaves it open)
  export let discard; // drops the changes and closes the editor

  onMount(() => {
    globals.update('companies'); // the file library's filter
    return () => ($actions = null);
  });
  // leaving the page with changes asks first, as the admin does; leaving anyway drops them
  guardLeaving(() => $modified, { discard: () => discard() });

  $: e = layout.findIndex((x) => x._id === $selected?.element);
  $: t = e >= 0 && $selected?.tile ? (layout[e].tiles?.findIndex((x) => x._id === $selected.tile) ?? -1) : -1;
  // what was picked is gone (deleted): back to the level above
  $: settle(e, t);
  function settle(e, t) {
    if ($selected && e < 0) $selected = null;
    else if ($selected?.tile && t < 0) $selected = { element: $selected.element };
  }

  // the picked block's moves for its buttons on the page, beside its name (see Element), as its panel's
  $: $actions = e >= 0 ? { move, remove: removeBlock, first: e === 0, last: e === layout.length - 1 } : null;

  async function pick(element = null, tile = null) {
    $selected = element ? { element, ...(tile && { tile }) } : null;
    if (!element) return;
    await tick();
    const on = document.querySelector(tile ? `[data-tile="${tile}"]` : `[data-element="${element}"]`);
    on?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function add(type) {
    const element =
      type === 'title'
        ? create.title({ title: 'Nowy tytuł' })
        : type === 'tiles'
          ? create.tiles({ tiles: [] })
          : create.category({ slug: categories[0]?.id });
    layout = [element, ...layout];
    pick(element._id);
  }

  function move(by) {
    const to = e + by;
    if (to < 0 || to >= layout.length) return;
    [layout[e], layout[to]] = [layout[to], layout[e]];
    layout = layout;
    pick(layout[to]._id);
  }

  async function removeBlock() {
    if (!(await ask('Blok zniknie ze strony po zapisaniu.', { title: 'Usunąć blok?', ok: 'Usuń', danger: true })))
      return;
    layout = layout.filter((_, i) => i !== e);
    $selected = null;
  }

  function addBanner() {
    const tile = newBanner(firstFree(layout[e].tiles));
    layout[e].tiles = [...layout[e].tiles, tile];
    pick(layout[e]._id, tile._id);
  }

  async function removeBanner() {
    if (!(await ask('Baner zniknie ze strony po zapisaniu.', { title: 'Usunąć baner?', ok: 'Usuń', danger: true })))
      return;
    layout[e].tiles = layout[e].tiles.filter((_, i) => i !== t);
    $selected = { element: layout[e]._id };
  }

  let saving = false;
  async function finish() {
    if (!$modified) return discard();
    saving = true;
    try {
      await save();
    } finally {
      saving = false;
    }
  }

  async function cancel() {
    const drop = await ask('Wszystko zmienione od ostatniego zapisu wróci do poprzedniego stanu.', {
      title: 'Odrzucić zmiany?',
      ok: 'Odrzuć',
      danger: true,
    });
    if (drop) discard();
  }
</script>

<!-- the admin's look, and where its popups go (see portal): over the website, a fixed panel and what it opens -->
<div class="ui-admin host" data-portal use:portal>
  <aside class="panel" aria-label="Edycja strony głównej">
    <header class="top">
      <Icon name="grid" width="1.1rem" dark />
      <span class="top__title">Edycja strony głównej</span>
    </header>

    <div class="body">
      {#if t >= 0}
        {#key $selected.tile}
          <Banner bind:tile={layout[e].tiles[t]} on:back={() => pick(layout[e]._id)} on:remove={removeBanner} />
        {/key}
      {:else if e >= 0}
        {#key $selected.element}
          <Block
            bind:element={layout[e]}
            {types}
            {categories}
            first={e === 0}
            last={e === layout.length - 1}
            on:back={() => pick()}
            on:move={(ev) => move(ev.detail)}
            on:remove={removeBlock}
            on:add={addBanner}
            on:pick={(ev) => pick(layout[e]._id, ev.detail)} />
        {/key}
      {:else}
        <Blocks
          {layout}
          {types}
          {categories}
          {addable}
          on:pick={(ev) => pick(ev.detail)}
          on:add={(ev) => add(ev.detail)} />
      {/if}
    </div>

    <!-- the page's save: once something's changed, keep it or drop it; nothing changed, just leave -->
    <footer class="foot" class:changed={$modified}>
      {#if $modified}
        <Button secondary edge on:click={cancel}>Odrzuć</Button>
        <Button icon="save" disabled={saving} on:click={finish}>Zapisz zmiany</Button>
      {:else}
        <Button icon="checkmark" secondary edge on:click={finish}>Zakończ edycję</Button>
      {/if}
    </footer>
  </aside>
  <Dialog />
</div>

<style>
  /* the website's type doesn't reach in: the admin's own sizes and line height, as on its pages */
  .host {
    display: contents;
    font-size: 1rem;
    line-height: normal;
    letter-spacing: normal;
  }

  /* Over the rail (16.5rem, see ui-website.css) and a little more, never over the page's text: the gutter beside
     the rail is at least 1.5rem. Below the rail's width it lies over the page, as a phone's menu does. */
  .panel {
    z-index: 90; /* over the page and its bars, under the admin's popups (1000, see Modal) */
    position: fixed;
    inset: 0 auto 0 0;
    display: flex;
    flex-direction: column;
    width: min(18rem, 100vw);
    border-right: var(--border);
    background-color: var(--board);
    box-shadow: var(--shadow-lifted);
  }
  .top {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    min-height: calc(2 * var(--cell));
    padding: 0 var(--half);
    border-bottom: var(--border-light);
    background-color: var(--paper);
  }
  .top__title {
    font-size: 0.95rem;
    font-weight: 700;
  }
  .foot {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--quarter);
    padding: var(--half);
    border-top: var(--border-light);
    background-color: var(--paper);
  }
  .foot.changed {
    grid-template-columns: auto 1fr;
  }
  .body {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    gap: var(--half);
    padding: var(--half);
  }
</style>
