<script>
  import { createEventDispatcher, tick } from 'svelte';
  import Button from '@c/Button.svelte';
  import DragHandle from '@c/DragHandle.svelte';
  import Modal from '@c/Modal.svelte';
  import MoveTo from '@c/MoveTo.svelte';
  import File, { fileProps } from '@c/library/File.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import { swatch } from '$/colors';
  import { colors } from '@/globals';
  import { sortable } from '@/sortable';
  import Icon from '$c/Icon.svelte';
  import { basename, namesOf, placeFor } from './images.js';
  import { findColor } from './utils.js';

  // Images from the api, waiting for an admin (found by a scan, or about to be imported with their products), among the
  // product's images there already: the whole product's images to put in order here. A new one taken off the list is
  // never offered again, the rest is imported; one there already taken off is removed from the product (an api's one is
  // then never offered again either, see planImages). "Później" (after a scan: `later`) decides nothing - the next
  // scan offers them again; importing products has none (a product without its photos isn't worth importing), Anuluj
  // instead. They're shown where they go - its gallery first, then its variants in the order of their codes, as the
  // product editor shows them - the new ones where the api has them (see reviewPlaces); each dragged into place there,
  // or moved to another place by its corner button. Every place is saved as left here. The api's are named after the
  // place they take (see namesOf), the ones there already renamed so too.
  export let title;
  // [{ product: { id | _uid, code, name }, href (an imported one's), places (see reviewPlaces), files (the library's
  // data of the ones there already), elsewhere (files the product shows in places not here: they keep their names),
  // flagNew (false: no "NOWE" - a product being imported, all of its images new) }]
  export let groups;
  export let busy = false;
  export let confirmText = 'Dodaj'; // what the button taking them is called ("Importuj" when importing products)
  export let cancelable = false; // an Anuluj before it: on:cancel (an import not started yet - nothing was written)
  export let later = true; // "Później": on:later

  const dispatch = createEventDispatcher();

  // the admin's version of them (put in order and moved here), made once: a parent drawing again keeps it - every
  // place shown; the rows there before kept (`before`: the ones not kept are deleted), and each image there already
  // knows its place (`home`: moved elsewhere, it gets a new row there)
  let work = null;
  $: if (!work)
    work = groups.map((g) => ({
      ...g,
      places: g.places.map((place, p) => ({
        ...place,
        tiles: place.tiles.map((t) => (t.fresh ? t : { ...t, home: p })),
        before: place.tiles.filter((t) => !t.fresh).map((t) => t.row),
        shown: true,
      })),
    }));

  // taken off: a new one by its url (in all its places, refused), one there already by its file (removed)
  let rejected = new Set(); // "product|source", "product|#file"
  const key = (group) => group.product.id ?? group.product._uid;
  const id = (group, tile) => `${key(group)}|${tile.fresh ? tile.source : `#${tile.file}`}`;
  function toggle(id) {
    rejected.has(id) ? rejected.delete(id) : rejected.add(id);
    rejected = rejected;
  }

  const sources = (group) => new Set(group.places.flatMap((p) => p.tiles.filter((t) => t.fresh).map((t) => t.source)));
  $: total = groups.reduce((sum, g) => sum + sources(g).size, 0);
  $: removed = [...rejected].filter((r) => r.includes('|#')).length;
  $: refused = rejected.size - removed;
  $: accepted = total - refused;
  $: anyThere = groups.some((g) => g.places.some((p) => p.tiles.some((t) => !t.fresh)));

  // what they're called now (a refused one: its url's name, a removed one: its own)
  $: names = new Map(work.map((g) => [g, namesOf(g, (t) => rejected.has(id(g, t)))]));
  const titleOf = (names, group, tile) =>
    names.get(group).get(tile.file ?? tile.source)?.title ??
    (tile.fresh ? basename(tile.source) : group.files?.get(tile.file)?.title) ??
    null;

  // a variant's colour: ours (an imported variant's id, a name we have, our multicolour - see uploadItem), else the
  // api's name and hex
  function paint(storage) {
    const ours = storage.multicolored
      ? $colors?.find((c) => c.multicolor)
      : storage.color_first != null && findColor(storage.color_first);
    if (ours) return ours;
    if (typeof storage.color_first !== 'string') return null;
    return { name: storage.color_first, color: storage._color_first_hex, multicolor: storage.multicolored };
  }

  // where an image can go: the gallery or one of the variants (by its place in `places`)
  const targets = (group) =>
    group.places.map(({ storage }, p) => {
      if (!storage) return { id: p, text: 'Galeria', icon: 'image_multiple' };
      const color = paint(storage);
      return {
        id: p,
        text: storage.api_color_code || `Wariant ${p}`,
        note: color?.name,
        ...(color && { swatch: swatch(color, null) }),
      };
    });
  const placeName = (place) => (place.storage ? place.storage.api_color_code || '—' : 'Galeria');
  const shownIn = (group, source) =>
    `Gdzie: ${group.places
      .filter((p) => p.tiles.some((t) => t.source === source))
      .map(placeName)
      .join(', ')}`;

  // every place's images, in one row
  const entries = (group) => group.places.flatMap((place, p) => place.tiles.map((tile, i) => ({ place, p, tile, i })));

  // dragged (only among the ones of its place, see sortable.js), or a place on with the arrows - not past the place's
  // first or last one
  function sort(group, from, to) {
    const list = entries(group);
    const [a, b] = [list[from], list[to]];
    if (!a || !b || a.p !== b.p) return false;
    a.place.tiles.splice(b.i, 0, ...a.place.tiles.splice(a.i, 1));
    work = work;
  }

  // one to another place, where the api has it there (else last); one there already (the same url, the same file) is
  // just taken from here. The focus goes with it (its button is made afresh there)
  const same = (a, b) => (a.source != null && a.source === b.source) || (a.file != null && a.file === b.file);
  async function move(group, from, tile, to) {
    const [source, target] = [group.places[from], group.places[to]];
    source.tiles.splice(source.tiles.indexOf(tile), 1);
    if (!target.tiles.some((t) => same(t, tile)))
      target.tiles.splice(placeFor(target.tiles, target.api, tile.source), 0, { ...tile });
    work = work;
    await tick();
    document.querySelector(`[data-key="${CSS.escape(`${key(group)}|${to}|${tile.key}`)}"] [role='combobox']`)?.focus();
  }

  // where a place's images start: a line in the gap before them - not at a row's start, where there's no gap before
  // them (worked out from the page: it changes while one is dragged, and with the window's width)
  function dividers(grid) {
    const mark = () => {
      const tiles = [...grid.querySelectorAll(':scope > .tile')];
      const left = tiles[0]?.offsetLeft;
      tiles.forEach((tile, i) => {
        tile.toggleAttribute('data-row-start', tile.offsetLeft === left);
        tile.toggleAttribute('data-place-start', i > 0 && tile.dataset.group !== tiles[i - 1].dataset.group);
      });
    };
    const resized = new ResizeObserver(mark);
    resized.observe(grid);
    const changed = new MutationObserver(mark);
    changed.observe(grid, { childList: true, subtree: true, attributeFilter: ['data-group'] });
    mark();
    return {
      destroy() {
        resized.disconnect();
        changed.disconnect();
      },
    };
  }

  // -> the groups with their places as looked through: each image `rejected` (refused or removed) or not, named
  // (`title`), one there already moved from its place a new row here
  function confirm() {
    const decided = work.map((g) => ({
      ...g,
      places: g.places.map((place, p) => ({
        ...place,
        tiles: place.tiles.map((t) => ({
          ...t,
          ...(!t.fresh && t.home !== p && { row: { img: t.file } }),
          rejected: rejected.has(id(g, t)),
          title: titleOf(names, g, t),
        })),
      })),
    }));
    dispatch('confirm', decided);
  }
</script>

<Modal type="fill" mat closeText={null}>
  <svelte:fragment slot="bar">
    {#if cancelable}
      <Button icon="close" secondary edge disabled={busy} on:click={() => dispatch('cancel')}>Anuluj</Button>
    {/if}
    <Button icon="ok" disabled={busy} on:click={confirm}>{busy ? 'Dodawanie...' : confirmText}</Button>
    <div class="ui-counts">
      <span class="ui-stat-value">{accepted}</span>
      <span class="ui-stat-label">Do dodania</span>
      <span class="ui-stat-value">{refused}</span>
      <span class="ui-stat-label">Odrzucone</span>
      {#if anyThere}
        <span class="ui-stat-value">{removed}</span>
        <span class="ui-stat-label">Do usunięcia</span>
      {/if}
    </div>
    <span class="ui-divider" />
    <h3>{title}</h3>
    <small class="muted">Kliknij zdjęcie, żeby je odrzucić lub usunąć. Skaner już nigdy go nie zaproponuje.</small>
    {#if later}
      <span class="later">
        <Button secondary edge disabled={busy} on:click={() => dispatch('later')}>Później</Button>
        <Tooltip><small>Zostaniesz zapytany o import tych zdjęć przy kolejnym skanie.</small></Tooltip>
      </span>
    {/if}
  </svelte:fragment>

  {#each work as group (key(group))}
    {@const places = targets(group)}
    {@const list = entries(group)}
    <div class="product">
      <div class="ui-h2 heading">
        <span class:opens={group.href}>
          <!-- an imported one opens in a new tab, as the API list's (its cube) -->
          {#if group.href}
            <Button
              size="sm"
              square
              tone="info"
              edge
              icon="cube"
              title="Otwórz zaimportowany produkt"
              on:click={() => window.open(group.href, '_blank', 'noreferrer')} />
          {/if}
          <span class="title" role="heading" aria-level="3">
            <span class="name">{group.product.name}</span>
            <span class="code">{group.product.code}</span>
          </span>
        </span>
      </div>
      <div
        class="ui-tiles ui-snap"
        inert={busy}
        use:sortable={{ sort: (from, to) => sort(group, from, to) }}
        use:dividers>
        {#each list as { place, p, tile }, j (`${p}|${tile.key}`)}
          <div class="tile" data-sortable data-group={p} data-key="{key(group)}|{p}|{tile.key}">
            <!-- a new one from its url (clicked: refused, or not), one there already from the library -->
            <File
              {...tile.fresh
                ? { src: tile.source, filename_download: basename(tile.source) }
                : fileProps(group.files?.get(tile.file) ?? { id: tile.file })}
              title={titleOf(names, group, tile)}
              note={tile.fresh
                ? shownIn(group, tile.source)
                : !tile.source
                  ? 'Spoza API: nazwa zostaje'
                  : group.elsewhere?.has(tile.file)
                    ? 'Też gdzie indziej: nazwa zostaje'
                    : null}
              flag={tile.fresh && group.flagNew !== false ? 'NOWE' : null}
              marked={rejected.has(id(group, tile))}
              remove={tile.fresh ? 'Odrzuć' : 'Usuń'}
              backing="var(--board)"
              on:click={() => toggle(id(group, tile))}>
              <svelte:fragment slot="tag">
                {#if place.storage}
                  {@const color = paint(place.storage)}
                  <span class="swatch" style:background={swatch(color, null)} />
                  <span class="tag-text">{color?.name ?? place.storage.api_color_code}</span>
                {:else}
                  <span class="tag-icon"><Icon fill name="image_multiple" dark /></span>
                  Galeria
                {/if}
              </svelte:fragment>
              <svelte:fragment slot="left">
                <DragHandle disabled={place.tiles.length < 2} on:step={(e) => sort(group, j, j + e.detail)} />
              </svelte:fragment>
              <!-- taking it off by a button too (a click on the tile does the same), and back -->
              <svelte:fragment slot="right">
                {#if places.length > 1}
                  <MoveTo targets={places} here={p} on:move={(e) => move(group, p, tile, e.detail)} />
                {/if}
                {#if rejected.has(id(group, tile))}
                  <Button
                    size="sm"
                    icon="arrow_undo"
                    secondary
                    title="Przywróć"
                    on:click={() => toggle(id(group, tile))} />
                {:else}
                  <Button
                    size="sm"
                    icon="delete"
                    dangerous
                    title={tile.fresh ? 'Odrzuć' : 'Usuń'}
                    on:click={() => toggle(id(group, tile))} />
                {/if}
              </svelte:fragment>
            </File>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</Modal>

<style>
  .swatch {
    flex: none;
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 50%;
    border: 1px solid rgb(0 0 0 / 0.2);
  }
  /* as big as the swatches beside the variants' names */
  .tag-icon {
    flex: none;
    display: grid;
    width: 0.85rem;
    height: 0.85rem;
  }
  .tag-text {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  h3 {
    margin: 0;
  }
  .muted {
    color: var(--grey-500);
  }
  .later {
    display: flex;
    margin-left: auto;
  }

  /* a product as an editor's section (as the picker's groups, see Library): its name and code on a paper label
     (.ui-h2), its photos under it, the next label on the next line of the mat. With the button opening it in the
     label: the label a cell and a half (still whole half cells), the button as far in from its edge as from its top
     and bottom */
  .heading > span {
    min-width: 0;
  }
  .opens {
    height: calc(1.5 * var(--cell) - 1px);
    padding-left: calc((1.5 * var(--cell) - 3px - 1.5rem) / 2); /* (the label's inside, less the button, halved) */
  }
  /* the name and the smaller code on one baseline */
  .title {
    display: flex;
    align-items: baseline;
    gap: 0.5em;
    min-width: 0;
  }
  .name {
    min-width: 0;
    overflow: clip; /* (not hidden: that would make its baseline its bottom edge) */
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /* after the name, as a field's label (.ui-label), bigger */
  .code {
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ink-label);
  }

  .tile {
    position: relative;
  }
  /* between two places' images: a line in the middle of the gap (see dividers), from where the photo's squircled corner
     turns straight to the bottom of the subtitle's letters, taking no room (not beside the dragged one's copy) */
  .tile:global([data-place-start]:not([data-row-start]):not(.sortable-fallback))::before {
    content: '';
    position: absolute;
    top: calc(var(--box-radius) / 3);
    bottom: 0.25rem;
    left: calc(var(--tiles-gap) / -2); /* half the tiles' gap (ui-tiles) */
    width: 3px;
    transform: translateX(-50%);
    border-radius: 2px;
    background-color: var(--blue-700);
  }
</style>
