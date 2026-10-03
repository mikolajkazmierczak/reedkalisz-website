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
  import { basename, hasNew, namesOf, placeFor } from './images.js';
  import { findColor } from './utils.js';

  // Images from the api, waiting for an admin (found by a scan, or about to be imported with their products): the ones
  // taken off the list are never offered again, the rest is imported. "Później" (after a scan: `later`) decides
  // nothing - the next scan offers them again; importing products has none (a product without its photos isn't worth
  // importing), Anuluj instead. They're shown where they go - its gallery first, then its variants in the order of
  // their codes, as the product editor shows them - among the ones there already, where the api has them (see
  // reviewPlaces); each dragged into place there (the ones there too), or a new one moved to another place by its
  // corner button. The places with new images are shown (and a place one is moved to; one shown stays so) and saved as
  // left here, the others untouched. The api's are named after the place they take (see namesOf), the ones there
  // already renamed so too.
  export let title;
  // [{ product: { id | _uid, code, name }, href (an imported one's), places (see reviewPlaces), files (the library's
  // data of the ones there already), elsewhere (files the product shows in places not here: they keep their names) }]
  export let groups;
  export let busy = false;
  export let confirmText = 'Dodaj'; // what the button taking them is called ("Importuj" when importing products)
  export let cancelable = false; // an Anuluj before it: on:cancel (an import not started yet - nothing was written)
  export let later = true; // "Później": on:later

  const dispatch = createEventDispatcher();

  // the admin's version of them (put in order and moved here), made once: a parent drawing again keeps it
  let work = null;
  $: if (!work)
    work = groups.map((g) => ({
      ...g,
      places: g.places.map((p) => ({ ...p, tiles: [...p.tiles], shown: hasNew(p) })),
    }));

  let rejected = new Set(); // "product|source"
  const key = (group) => group.product.id ?? group.product._uid;
  const id = (group, source) => `${key(group)}|${source}`;
  function toggle(id) {
    rejected.has(id) ? rejected.delete(id) : rejected.add(id);
    rejected = rejected;
  }

  const sources = (group) => new Set(group.places.flatMap((p) => p.tiles.filter((t) => t.fresh).map((t) => t.source)));
  $: total = groups.reduce((sum, g) => sum + sources(g).size, 0);
  $: accepted = total - rejected.size;

  // what they're called now (a refused one: its url's name); one named after a place not shown keeps its name
  $: names = new Map(work.map((g) => [g, namesOf(g, (t) => t.fresh && rejected.has(id(g, t.source)))]));
  function titleOf(names, group, tile) {
    const named = names.get(group).get(tile.file ?? tile.source);
    if (named && (tile.fresh || group.places[named.place].shown)) return named.title;
    return (tile.fresh ? basename(tile.source) : group.files?.get(tile.file)?.title) ?? null;
  }

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

  // the places shown, each's in a row
  const entries = (group) =>
    group.places.flatMap((place, p) => (place.shown ? place.tiles.map((tile, i) => ({ place, p, tile, i })) : []));

  // dragged (only among the ones of its place, see sortable.js), or a place on with the arrows - not past the place's
  // first or last one
  function sort(group, from, to) {
    const list = entries(group);
    const [a, b] = [list[from], list[to]];
    if (!a || !b || a.p !== b.p) return false;
    a.place.tiles.splice(b.i, 0, ...a.place.tiles.splice(a.i, 1));
    work = work;
  }

  // a new one to another place, where the api has it there (else last); one there already is just taken from here.
  // The focus goes with it (its button is made afresh there)
  async function move(group, from, tile, to) {
    const [source, target] = [group.places[from], group.places[to]];
    source.tiles.splice(source.tiles.indexOf(tile), 1);
    if (!target.tiles.some((t) => t.source === tile.source))
      target.tiles.splice(placeFor(target.tiles, target.api, tile.source), 0, { ...tile });
    target.shown = true;
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

  // -> the groups with their places as looked through: `shown`, a new one `rejected`, each named (`title`)
  function confirm() {
    const decided = work.map((g) => ({
      ...g,
      places: g.places.map((place) => ({
        ...place,
        tiles: place.tiles.map((t) => ({
          ...t,
          rejected: t.fresh && rejected.has(id(g, t.source)),
          title: titleOf(names, g, t),
        })),
      })),
    }));
    dispatch('confirm', decided);
  }
</script>

<Modal type="fill" dotted closeText={null}>
  <svelte:fragment slot="bar">
    {#if cancelable}
      <Button icon="close" secondary edge disabled={busy} on:click={() => dispatch('cancel')}>Anuluj</Button>
    {/if}
    <Button icon="ok" disabled={busy} on:click={confirm}>{busy ? 'Dodawanie...' : confirmText}</Button>
    <div class="ui-counts">
      <span class="ui-stat-value">{accepted}</span>
      <span class="ui-stat-label">Do dodania</span>
      <span class="ui-stat-value">{rejected.size}</span>
      <span class="ui-stat-label">Odrzucone</span>
    </div>
    <span class="ui-divider" />
    <h3>{title}</h3>
    <small class="muted">Kliknij zdjęcie, żeby je odrzucić. Skaner już nigdy ich nie zaproponuje.</small>
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
      <div class="heading">
        <!-- an imported one opens in a new tab, as the API list's (its cube) -->
        {#if group.href}
          <Button
            tone="info"
            edge
            icon="cube"
            title="Otwórz zaimportowany produkt"
            on:click={() => window.open(group.href, '_blank', 'noreferrer')} />
        {/if}
        <h3 class="ui-h3">{group.product.code} {group.product.name}</h3>
      </div>
      <div class="ui-tiles" inert={busy} use:sortable={{ sort: (from, to) => sort(group, from, to) }} use:dividers>
        {#each list as { place, p, tile }, j (`${p}|${tile.key}`)}
          <div class="tile" data-sortable data-group={p} data-key="{key(group)}|{p}|{tile.key}">
            <!-- a new one from its url (clicked: refused, or not), one there already from the library -->
            <File
              {...tile.fresh
                ? { src: tile.source, filename_download: basename(tile.source) }
                : fileProps(group.files?.get(tile.file) ?? { id: tile.file })}
              title={titleOf(names, group, tile)}
              note={tile.fresh ? shownIn(group, tile.source) : tile.source ? null : 'Spoza API: nazwa zostaje'}
              flag={tile.fresh ? 'NOWE' : null}
              marked={tile.fresh && rejected.has(id(group, tile.source))}
              remove="Odrzuć"
              clickable={tile.fresh}
              backing="var(--grey-100)"
              on:click={() => tile.fresh && toggle(id(group, tile.source))}>
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
            </File>
            <span class="corner left">
              <DragHandle disabled={place.tiles.length < 2} on:step={(e) => sort(group, j, j + e.detail)} />
            </span>
            {#if tile.fresh && places.length > 1}
              <span class="corner right">
                <MoveTo targets={places} here={p} on:move={(e) => move(group, p, tile, e.detail)} />
              </span>
            {/if}
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

  .product + .product {
    margin-top: 0.5rem;
  }
  /* spaced as the picker's sections (see Library) */
  .heading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  /* the handle and the move button over the tile's top corners (the tile's own parts take no clicks, see File) */
  .tile {
    position: relative;
    container-type: inline-size; /* its photo is as tall as it is wide (the divider's height, below) */
  }
  /* between two places' images: a line in the middle of the gap beside the photos (see dividers), taking no room (not
     beside the dragged one's copy) */
  .tile:global([data-place-start]:not([data-row-start]):not(.sortable-fallback))::before {
    content: '';
    position: absolute;
    top: 0.75rem;
    height: calc(100cqw - 1.5rem); /* beside the photo, a little short of its edges */
    left: -0.5rem; /* half the tiles' gap (ui-tiles) */
    width: 2px;
    transform: translateX(-50%);
    border-radius: 2px;
    background-color: var(--blue-500);
  }
  @media (max-width: 50rem) {
    .tile:global([data-place-start]:not([data-row-start]):not(.sortable-fallback))::before {
      left: -0.25rem;
    }
  }
  .corner {
    z-index: 1;
    position: absolute;
    top: 0.6rem;
    display: flex;
    opacity: 0;
    transition: opacity 100ms;
  }
  .corner.left {
    left: 0.6rem;
  }
  .corner.right {
    right: 0.6rem;
  }
  /* shown with the tile's hover (and while used); always on a touch screen, which has none */
  .tile:hover .corner,
  .corner:focus-within,
  .corner:has([aria-expanded='true']) {
    opacity: 1;
  }
  @media (hover: none) {
    .corner {
      opacity: 1;
    }
  }
</style>
