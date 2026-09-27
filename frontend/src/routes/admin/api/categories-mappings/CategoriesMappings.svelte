<script>
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { deep, diffSync } from '%/utils';
  import { categories } from '@/globals';
  import { tell } from '@/dialog';
  import { mappedCategories } from '@/sync';
  import { ancestorIds, categoryIndex, categoryLabels, categoryOptions, mostSpecific } from '@/categories';
  import Button from '@c/Button.svelte';
  import Arrow from '../mappings/Arrow.svelte';
  import Chip from '../mappings/Chip.svelte';
  import Panel from '../mappings/Panel.svelte';
  import Grid from '@c/table/Grid.svelte';
  import CategoryPicker from './CategoryPicker.svelte';
  import { listApiCategories, pathKey, resolveCategories } from '../categories.js';
  import { staleMappings, unmappedPaths } from '../status.js';

  export let apiCompany;
  export let apiItems = null; // the api snapshot
  export let query = ''; // from the search field in the bar

  const BLOCK = 'block'; // picker value: map the category to nothing, so it doesn't inherit

  let mappingsOriginal = [];
  let mappings = [];
  let expanded = new Set();
  let picking = null; // the row with its category picker open (one at a time, there are ~200 options)

  // once per company: a store update (even the echo of a save) mustn't wipe the edits (a new scan remounts this)
  let loadedId;
  $: if (apiCompany.id !== loadedId) {
    loadedId = apiCompany.id;
    load();
  }
  // the order of a row's categories doesn't matter (products get them in tree order)
  const comparable = (list) => list.map((m) => ({ ...m, categories: [...(m.categories ?? [])].sort((a, b) => a - b) }));
  $: unsaved = diffSync(comparable(mappings), comparable(mappingsOriginal)).changed;

  // always in the order they're saved in, so undoing an edit by hand leaves nothing unsaved
  const pathOrder = (a, b) => pathKey(a.path).localeCompare(pathKey(b.path), 'pl');

  function load() {
    mappingsOriginal = deep.copy(apiCompany.api_categories_mappings ?? []).sort(pathOrder);
    mappings = deep.copy(mappingsOriginal);
  }

  // the supplier's categories, as found in the products of the last scan
  $: nodes = listApiCategories(apiItems);
  $: byPath = new Map(mappings.map((m) => [pathKey(m.path), m]));
  $: stale = staleMappings(mappings, nodes);

  // our categories: in tree order for picking, as "ROOT › child" for reading
  $: index = categoryIndex($categories);
  $: labels = categoryLabels($categories); // "4.5.3 Latarki", the whole path on hover
  const label = (id) => labels.get(id)?.label ?? `usunięta kategoria #${id}`;

  // what can be picked for a row: not what it has, nor anything above it (a subcategory is more specific)
  function pickerOptions(own, ignored) {
    const taken = new Set([...own, ...own.flatMap((id) => ancestorIds(id, index.parents))]);
    return [
      { id: BLOCK, text: 'Ignoruj', special: true, disabled: ignored },
      ...categoryOptions(labels).map((o) => {
        const chosen = own.includes(o.id); // picked again: taken away
        return { ...o, chosen, disabled: taken.has(o.id) && !chosen };
      }),
    ];
  }

  // the categories (and every one above them) whose products won't get ours from them: their counts are red
  $: unmapped = new Set(
    unmappedPaths(mappings, apiItems, index).flatMap((path) => path.map((_, i) => pathKey(path.slice(0, i + 1)))),
  );

  // the supplier's categories with a mapping, of their own or from above
  $: mapped = nodes.filter((n) => byPath.has(pathKey(n.path)) || inherited(n.path)).length;

  // the mapping a category takes after: its own, or the closest one above it
  function inherited(path) {
    for (let depth = path.length - 1; depth > 0; depth--) {
      const m = byPath.get(pathKey(path.slice(0, depth)));
      if (m) return m;
    }
    return null;
  }

  // rows shown: the expanded part of the tree, or everything matching the search (with its parents)
  $: q = query?.trim().toLowerCase();
  $: visible = nodes.filter((node) => {
    if (q) {
      const key = pathKey(node.path);
      return nodes.some((n) => n.name.toLowerCase().includes(q) && pathKey(n.path.slice(0, node.path.length)) === key);
    }
    return node.path.slice(0, -1).every((_, i) => expanded.has(pathKey(node.path.slice(0, i + 1))));
  });

  function toggle(node) {
    const key = pathKey(node.path);
    expanded.has(key) ? expanded.delete(key) : expanded.add(key);
    expanded = expanded;
  }
  function expandAll(open) {
    expanded = new Set(open ? nodes.filter((n) => n.hasChildren).map((n) => pathKey(n.path)) : []);
  }

  function setCategories(path, list) {
    const others = mappings.filter((m) => pathKey(m.path) !== pathKey(path));
    mappings = (list === null ? others : [...others, { path, categories: list }]).sort(pathOrder);
  }
  function add(node, value) {
    // the picker stays open for the next one; "Ignoruj" (a special) closes it
    if (value === BLOCK) return setCategories(node.path, []);
    const own = byPath.get(pathKey(node.path))?.categories ?? [];
    // a subcategory of one it has replaces it
    if (!own.includes(value)) setCategories(node.path, mostSpecific([...own, value], index.parents));
  }
  function remove(path, id) {
    const rest = byPath.get(pathKey(path)).categories.filter((c) => c !== id);
    setCategories(path, rest.length ? rest : null); // the last one gone: inherit again
  }

  async function save() {
    const data = mappings.map(({ path, categories }) => ({ path, categories }));
    await api.items('companies').updateOne(apiCompany.id, { api_categories_mappings: data.length ? data : null });
    heimdall.emit('companies', apiCompany.id);
    // the scanner only removes categories a mapping leads to: one a product got and no longer gets stays on it
    // (unless it now gets a subcategory of it, which replaces it)
    const after = mappedCategories({ api_categories_mappings: data });
    const dropped = new Set();
    for (const i of apiItems ?? []) {
      const now = resolveCategories(data, i._categories, index);
      for (const id of resolveCategories(mappingsOriginal, i._categories, index)) {
        if (!after.has(id) && !now.some((t) => ancestorIds(t, index.parents).includes(id))) dropped.add(id);
      }
    }
    mappingsOriginal = deep.copy(data);
    mappings = deep.copy(data);
    if (dropped.size) {
      tell(
        `Żadne mapowanie nie prowadzi już do: ${[...dropped].map(label).join(', ')}. Produkty tego producenta, które je mają, ` +
          'zachowają je - skaner ich nie usunie. Trzeba to zrobić ręcznie.',
        { title: 'Uwaga' },
      );
    }
  }

  function cancel() {
    mappings = deep.copy(mappingsOriginal);
  }
</script>

<Panel title="Mapowanie kategorii" {unsaved} on:save={save} on:cancel={cancel}>
  <svelte:fragment slot="summary">
    {#if nodes.length}
      <small>Zmapowano <b>{mapped}</b> / {nodes.length}</small>
      <small class="muted">Kategorie, które nie występują w regułach, nie są usuwane przez skaner.</small>
    {/if}
  </svelte:fragment>
  {#if !nodes.length}
    <p class="muted">Zeskanuj API, aby zobaczyć kategorie producenta.</p>
  {/if}

  {#if stale.length}
    <small class="error">
      Mapowania kategorii, których nie ma już w API. Niczego nie przypisują, ale skaner wciąż usuwa ich kategorie z
      produktów. Po usunięciu mapowania te kategorie zostaną na produktach:
    </small>
    <div class="chips">
      {#each stale as m (pathKey(m.path))}
        <Chip removable missing on:remove={() => setCategories(m.path, null)}>{m.path.join(' › ')}</Chip>
      {/each}
    </div>
  {/if}
  <svelte:fragment slot="after">
    {#if nodes.length}
      <Grid
        columns="minmax(12rem, 20rem) 4rem 1.5rem minmax(18rem, 1fr)"
        empty={visible.length ? null : `Brak kategorii pasujących do „${query}”.`}>
        <svelte:fragment slot="head">
          <span class="tree">
            <span class="step">
              <Button
                small
                ghost
                icon="hierarchy"
                title={expanded.size ? 'Zwiń wszystko' : 'Rozwiń wszystko'}
                on:click={() => expandAll(!expanded.size)} />
            </span>
            Kategoria producenta
          </span>
          <span class="count" class:unmapped={unmapped.size}>Produkty</span>
          <span />
          <span>Kategorie u nas</span>
        </svelte:fragment>

        {#each visible as node (pathKey(node.path))}
          {@const own = byPath.get(pathKey(node.path))}
          {@const parent = own ? null : inherited(node.path)}
          {@const open = q || expanded.has(pathKey(node.path))}
          <div class="row" class:mapped={own}>
            <!-- a line under the arrow of every level above: the tree's indent; the arrow and the name are one button -->
            <span class="tree">
              {#each { length: node.depth } as _}<span class="step guide" />{/each}
              {#if node.hasChildren && !q}
                <span class="toggle" title={node.path.join(' › ')}>
                  <Button
                    small
                    ghost
                    start
                    width="100%"
                    icon={open ? 'chevron_down' : 'chevron_right'}
                    on:click={() => toggle(node)}>
                    <span class="name name--in-button">{node.name}</span>
                  </Button>
                </span>
              {:else}
                <span class="name" title={node.path.join(' › ')}>{node.name}</span>
              {/if}
            </span>
            <span class="count" class:unmapped={unmapped.has(pathKey(node.path))}>{node.count}</span>
            <Arrow />
            <span class="targets">
              {#if own && own.categories.length === 0}
                <Chip removable blocked on:remove={() => setCategories(node.path, null)}>ignoruj</Chip>
              {:else if own}
                {#each own.categories as id}
                  <Chip
                    removable
                    missing={!labels.has(id)}
                    title={labels.get(id)?.path}
                    on:remove={() => remove(node.path, id)}>
                    {label(id)}
                  </Chip>
                {/each}
              {:else if parent?.categories.length}
                {#each parent.categories as id}
                  <Chip inherited title="{labels.get(id)?.path ?? ''} (z nadrzędnej: {parent.path.join(' › ')})">
                    {label(id)}
                  </Chip>
                {/each}
              {:else if parent}
                <Chip inherited blocked title="Z nadrzędnej: {parent.path.join(' › ')}">ignoruj</Chip>
              {/if}
              {#if picking === pathKey(node.path)}
                <CategoryPicker
                  options={pickerOptions(own?.categories ?? [], !!own && !own.categories.length)}
                  on:pick={(e) => add(node, e.detail)}
                  on:unpick={(e) => remove(node.path, e.detail)}
                  on:close={() => (picking = null)} />
              {:else}
                <Button small dashed icon="add" on:click={() => (picking = pathKey(node.path))}>kategoria</Button>
              {/if}
            </span>
          </div>
        {/each}
      </Grid>
    {/if}
  </svelte:fragment>
</Panel>

<style>
  /* Lined up by what's drawn, like the categories next to the products: a name without an arrow starts where its
     siblings' ">" does, a child's ">" (or name) where its parent's name does. The line of a level runs under the middle
     of its parent's arrow, just before the children's buttons. Bigger than a small button: it's read a lot */
  .tree {
    --height: 1.75rem;
    --font: 0.95rem;
    --icon: 1rem;
    --gap: 0.35rem; /* between the arrow and the name */
    --arrow-in: calc(0.375 * var(--icon)); /* where the ">" starts in its icon: a name without one starts there */
    --step: calc(var(--icon) - var(--arrow-in) + var(--gap));
    /* the button's padding before the arrow: 0.225rem from a level's line to the level under it */
    --pad-start: calc(var(--step) - var(--icon) / 2 - 0.225rem);
    display: flex;
    align-items: center;
    align-self: stretch;
    min-width: 0;
  }
  .step {
    flex: none;
    position: relative;
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
  }
  .step.guide {
    width: var(--step);
  }
  /* through the row's padding too, so the lines of the rows join up */
  .guide::before {
    content: '';
    position: absolute;
    top: calc(-1 * var(--row-pad));
    bottom: calc(-1 * var(--row-pad));
    left: calc(var(--pad-start) + var(--icon) / 2);
    border-left: solid 1px var(--black-10);
  }
  .toggle {
    flex: 1;
    min-width: 0;
  }
  /* every row as tall as a button of the tree, one with an arrow or not */
  .row .tree {
    min-height: var(--height);
  }
  .toggle :global(button.small) {
    height: var(--height);
  }
  .toggle :global(button.small .content.small) {
    gap: var(--gap);
    padding-left: var(--pad-start);
    font-size: var(--font);
  }
  /* its size, not 58% of the button's height (Icon sets it inline, hence !important) */
  .toggle :global(button.small .content.small > svg) {
    flex: none;
    width: var(--icon) !important;
    height: var(--icon) !important;
    transform: scale(0.9125); /* drawn a little smaller (0.9125rem), in the same place: what lines up with it stays */
  }
  .name {
    overflow: hidden;
    min-width: 0;
    padding-left: calc(var(--pad-start) + var(--arrow-in)); /* without an arrow: where its siblings' ">" starts */
    font-size: var(--font);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .name--in-button {
    padding-left: 0; /* the button's padding, the arrow and its gap are before it */
  }
  .row.mapped .name {
    font-weight: bold;
  }
  .count {
    font-size: 0.85rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--grey-500);
  }
  .count.unmapped {
    color: var(--red-500);
  }
  /* one line: the chips give way (cut, whole on hover), the button doesn't */
  .targets :global(.chip) {
    flex: 0 1 auto;
    min-width: 0;
  }
  .targets > :global(*) {
    flex-shrink: 0;
  }
  .targets {
    min-width: 0;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.25rem;
  }
</style>
