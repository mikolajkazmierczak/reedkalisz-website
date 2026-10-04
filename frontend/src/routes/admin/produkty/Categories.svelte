<script>
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { makeTree } from '%/utils';
  import { globals, categories } from '@/globals';
  import { categoryLabels } from '@/categories';
  import { plural } from '@/plural';
  import Button from '@c/Button.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import Category from './Category.svelte';

  export let searchParams = null;
  export let category;

  $: searchParams?.set({ c: category });

  let items;
  let open; // the branch that's open (see Category): at first the selected category's, or the first one

  async function read() {
    items = makeTree($categories);
    if (open === undefined) open = categoryLabels($categories).get(category)?.number ?? '1';
  }

  // products without a category: "Bez kategorii" is orange while there are any
  let uncategorized = 0;
  async function countUncategorized() {
    const options = { fields: ['id'], filter: { categories: { _null: true } }, limit: 0, meta: 'filter_count' };
    uncategorized = (await api.items('products').readByQuery(options)).meta.filter_count;
  }
  countUncategorized();
  heimdall.listen(({ match }) => {
    if (match('products')) countUncategorized();
  });

  // a phone: the tree folds away under a button saying which category is picked (it's long: the products come first)
  let unfolded = false;
  $: (category, (unfolded = false));
  $: picked = category === -1 ? 'Bez kategorii' : category && categoryLabels($categories ?? []).get(category);

  globals.update(categories);
  $: $categories && read();
</script>

<sidebar class="ui-snap">
  <div>
    <div class="all">
      {#each [{ id: null, name: 'Wszystkie' }, { id: -1, name: 'Bez kategorii' }] as { id, name }}
        {@const warn = id === -1 && uncategorized > 0}
        <span class:warn>
          <Button width="100%" dashed={category !== id} selected={category === id} on:click={() => (category = id)}>
            {name}
          </Button>
          {#if warn}
            <Tooltip>
              <small>
                {plural(uncategorized, 'produkt', 'produkty', 'produktów')} bez kategorii
              </small>
            </Tooltip>
          {/if}
        </span>
      {/each}
    </div>
    <button class="fold" aria-expanded={unfolded} on:click={() => (unfolded = !unfolded)}>
      <span class="ui-label">Kategoria</span>
      <span class="picked">{picked?.label ?? picked ?? 'wszystkie'}</span>
    </button>
    <div class="tree" class:unfolded>
      {#if items}
        {#each items as { id, name, enabled, children }, i}
          <Category {id} {name} {enabled} {children} depth={i + 1} bind:open bind:selected={category} />
        {/each}
      {/if}
    </div>
  </div>
</sidebar>

<style>
  /* the two buttons spaced as a bar's (.ui-bar: level with the bar's beside it), the tree 0.6875rem under them; no
     taller than the page (see .ui-fill): the tree scrolls, the buttons stay */
  sidebar {
    display: flex;
    flex-direction: column;
    align-self: start;
    max-height: calc(100% - 1px); /* (its slot is the row, less the 1px it sits inside it) */
    min-height: 0;
    padding: var(--bar-pad) var(--box-pad);
    /* always: a long name wraps (the gadgets' second level fits in one line, with room to spare); whole half cells of
       the mat with the gap after it (the table starting on them), less the 1px it sits inside its slot */
    width: calc(23 * var(--half) - 1px);
    border-radius: var(--box-radius);
    corner-shape: squircle;
    border: var(--border-light);
    background-color: var(--paper);
    box-shadow: var(--shadow);
  }
  sidebar > div {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .tree {
    overflow-y: auto;
    min-height: 0;
  }
  /* products without a category: the button's outline is orange, solid, whatever its state (hovered, pressed, picked) */
  .warn :global(button),
  .warn :global(button.dashed),
  .warn :global(button.dashed:hover),
  .warn :global(button.dashed:active) {
    outline: solid 1px var(--orange-500);
    outline-offset: -1px;
  }
  /* two halves */
  .all {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 0.6875rem;
  }

  .fold {
    display: none;
  }
  @media (max-width: 50rem) {
    sidebar {
      width: auto;
    }
    .fold {
      cursor: pointer;
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      width: 100%;
      padding: 0.25rem 0.5rem;
      border: none;
      border-radius: var(--border-radius);
      corner-shape: squircle;
      background-color: transparent;
      text-align: left;
    }
    .fold:hover {
      background-color: var(--black-6);
    }
    .fold::after {
      content: '▾';
      margin-left: auto;
    }
    .fold[aria-expanded='true']::after {
      content: '▴';
    }
    .fold .ui-label {
      flex: none;
      min-height: 0;
      padding: 0;
    }
    .picked {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-weight: 600;
    }
    .tree:not(.unfolded) {
      display: none;
    }
  }
</style>
