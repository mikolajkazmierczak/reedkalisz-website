<script>
  import { createEventDispatcher } from 'svelte';
  import { page } from '$app/stores';
  import Icon from '$c/Icon.svelte';

  import { editing, selected } from '#/layout/store';
  import { parseImg, parseHref } from '#/layout/utils';
  import { groundHex, productSrc } from '#/layout/grounds';
  import { grown, shrunk, jumped } from '#/layout/editor/grid';

  const dispatch = createEventDispatcher();

  export let tile;
  export let block; // its tiles block's _id: picked in the editor, the panel shows the banner within it
  export let tiles = []; // the block's banners: where there's room to grow or move into, in the editor

  $: ({ href, target } = parseHref(tile.uri));

  // On its ground, the picture in the room beside the text or in the whole banner, covering or contained (see grounds'
  // FITS), the room reaching the banner's edges unless it has a margin; the text on its card.
  $: ground = groundHex(tile.ground);
  $: picture = parseImg(tile.img);
  $: [room, fill] = tile.fit.split('-'); // side | full, cover | contain
  // the banner preset's version once it exists (the homepage's load asks), or when it fails after all the original
  let failed = null;
  $: src = failed === picture ? picture : productSrc(picture, $page.data.bannerPreset);
  // a server-rendered picture starts loading before the page is interactive, so it can fail (or load) before anything
  // listens: that's checked when it mounts as well (one lazy, not loading yet, isn't `complete`)
  function fallback(img) {
    const fail = () => (failed = picture);
    if (img.complete && !img.naturalWidth) fail();
    img.addEventListener('error', fail);
    return { destroy: () => img.removeEventListener('error', fail) };
  }
  // its proportions, once it's loaded: covering, it's sized to cover its room, and what sticks out is cut by the
  // banner, not the room (until then the room cuts it)
  let ratio = null;
  function measure(img) {
    const read = () => img.naturalWidth && (ratio = img.naturalWidth / img.naturalHeight);
    if (img.complete) read();
    img.addEventListener('load', read);
    return { destroy: () => img.removeEventListener('load', read) };
  }

  $: chosen = $editing && $selected?.tile === tile._id;
  $: arrowed = !!tile.button && (!!tile.uri || $editing);

  // one element per <br>-separated line
  const lines = (html) =>
    html
      .split(/<br\s*\/?>/i)
      .map((line) => line.trim())
      .filter((line) => line && line !== '&nbsp;');

  // in the editor a banner is picked, not followed
  function pick(e) {
    if (!$editing) return;
    e.preventDefault();
    e.stopPropagation(); // (not its block)
    $selected = { element: block, tile: tile._id };
  }

  // The picked banner's sides: each pulled out a cell or pushed in one, and the banner moved towards it: a step into
  // free cells, or past the banners there, swapping places (see jumped).
  const SIDES = [
    { side: 'top', out: 'arrow_up', in: 'arrow_down', grow: 'Powiększ w górę', shrink: 'Zmniejsz od góry' },
    { side: 'right', out: 'arrow_right', in: 'arrow_left', grow: 'Powiększ w prawo', shrink: 'Zmniejsz od prawej' },
    { side: 'bottom', out: 'arrow_down', in: 'arrow_up', grow: 'Powiększ w dół', shrink: 'Zmniejsz od dołu' },
    { side: 'left', out: 'arrow_left', in: 'arrow_right', grow: 'Powiększ w lewo', shrink: 'Zmniejsz od lewej' },
  ];
  const MOVES = {
    top: { step: 'Przesuń w górę', jump: 'Przestaw nad baner wyżej' },
    right: { step: 'Przesuń w prawo', jump: 'Przestaw za baner z prawej' },
    bottom: { step: 'Przesuń w dół', jump: 'Przestaw pod baner niżej' },
    left: { step: 'Przesuń w lewo', jump: 'Przestaw przed baner z lewej' },
  };
  // (what each side can do; `reach`, how far its handle reaches in: half of it, its buttons 1.75rem and its edges 2px;
  // with no handle, as one with a button, so every side's move is as far from its edge but by a handle of two)
  $: sides = chosen
    ? SIDES.map((s) => {
        const more = grown(tiles, tile, s.side);
        const less = shrunk(tile, s.side);
        const jump = jumped(tiles, tile, s.side);
        const moves = jump?.moves;
        const buttons = !!more + !!less;
        const label = jump && MOVES[s.side][jump.over ? 'jump' : 'step'];
        return { ...s, more, less, moves, label, reach: `${Math.max(buttons, 1) * 0.875 + 0.125}rem` };
      })
    : [];
</script>

<div
  class="wrapper"
  class:off={tile.hide && !$editing}
  class:wide={tile.width >= 3}
  style:--span={tile.width / tile.height}
  style="grid-row: {tile.row} / span {tile.height}; grid-column: {tile.column} / span {tile.width};">
  {#if !tile.hide || $editing}
    <a
      href={$editing ? null : href}
      {target}
      class="tile"
      class:href={!$editing && tile.uri}
      class:editable={$editing}
      class:chosen
      class:hidden={tile.hide}
      style:--ground={ground}
      data-tile={tile._id}
      role={$editing ? 'button' : null}
      tabindex={$editing ? 0 : null}
      aria-pressed={$editing ? chosen : null}
      on:click={pick}
      on:keydown={(e) => e.key === 'Enter' && pick(e)}>
      <div class="content">
        <div class="panel" class:arrowed>
          <div class="text">
            {#if tile.title}
              <h2 class="title">
                {#each lines(tile.title) as line}<span class="line">{@html line}</span>{' '}{/each}
              </h2>
            {/if}
            {#if tile.subtitle}
              <p class="subtitle">
                {#each lines(tile.subtitle) as line}<span class="line">{@html line}</span>{' '}{/each}
              </p>
            {/if}
          </div>
          {#if arrowed}
            <!-- not a link: the tile already is one, and nested links break the server-rendered HTML -->
            <span class="button">
              <span class="button__text">{tile.button}</span>
              <Icon name="arrow_right" width="1.15em" height="1.15em" color="currentColor" />
            </span>
          {/if}
        </div>
        {#if picture}
          <span class="picture {room} {fill}" class:margin={tile.margin}>
            <span class="fit" class:sized={ratio} style:--ratio={ratio}
              ><img {src} alt="" loading="lazy" decoding="async" draggable="false" use:fallback use:measure /></span>
          </span>
        {/if}
      </div>
    </a>
    {#if chosen}
      <div class="handles">
        {#each sides as { side, out, in: inward, grow, shrink, more, less }}
          {#if more || less}
            <span class="handle {side}">
              {#if more}
                <button type="button" title={grow} on:click|stopPropagation={() => dispatch('place', more)}
                  ><Icon name={out} width="0.95rem" color="currentColor" /></button>
              {/if}
              {#if less}
                <button type="button" title={shrink} on:click|stopPropagation={() => dispatch('place', less)}
                  ><Icon name={inward} width="0.95rem" color="currentColor" /></button>
              {/if}
            </span>
          {/if}
        {/each}
        <div class="moves">
          {#each sides as { side, moves, label, reach }}
            {#if moves}
              <button
                type="button"
                class="move {side}"
                style:--reach={reach}
                title={label}
                aria-label={label}
                on:click|stopPropagation={() => dispatch('move', moves)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9h9V4.5L21 12l-8.5 7.5V15h-9z" /></svg>
              </button>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .wrapper {
    position: relative;
    min-width: 0; /* (taller than its proportions, it grows down: they don't widen it, past the page) */
  }

  /* Squircled, its radius following the window (4rem on the widest), apart from the others (see Tiles). */
  .tile {
    --tile-r: clamp(1.5rem, 0.74rem + 3.24vw, 4rem);
    --inset: clamp(0.75rem, 0.3rem + 1.2vw, 1.5rem);
    --pad-y: clamp(0.875rem, 0.45rem + 1.1vw, 1.375rem); /* (the card's) */
    --margin: calc(var(--pad-y) / 2); /* a picture's with a margin: half the card's padding */
    /* (its width is what its layout follows: narrow, the picture goes under the card, see below) */
    container-type: inline-size;
    overflow: clip; /* (not hidden: a scroll container wouldn't grow with its card) */
    z-index: 0;
    position: relative;
    display: grid; /* (its content filling it, however tall) */
    width: 100%;
    min-height: 100%; /* its grid cell's or its proportions' height at least; taller when its card needs it */
    border-radius: var(--tile-r);
    corner-shape: squircle;
    background-color: var(--ground);
    text-decoration: none;
  }
  /* Hover frame on its own layer: the tile's box-shadow painted over the picture. */
  .tile::after {
    content: '';
    z-index: 2;
    position: absolute;
    inset: 0;
    border-radius: inherit;
    corner-shape: inherit;
    box-shadow: inset 0 0 0 0 var(--ink);
    transition: box-shadow var(--dur) var(--ease-hover);
    pointer-events: none;
  }
  /* Not selectable outside the editor. */
  .tile:not(.editable) {
    -webkit-user-select: none;
    user-select: none;
  }
  .tile.href:hover::after {
    box-shadow: inset 0 0 0 2px var(--ink);
  }

  /* in the editor: picked by a click, the one picked framed thick in the admin's navy; a hidden one faded */
  .tile.editable {
    cursor: pointer;
  }
  .tile.editable:hover::after {
    box-shadow: inset 0 0 0 2px rgb(27 47 78 / 0.5);
  }
  .tile.chosen::after,
  .tile.chosen:hover::after,
  .tile.editable:focus-visible::after {
    box-shadow: inset 0 0 0 4px var(--navy);
  }
  .tile.editable:focus-visible {
    outline: none;
  }
  .tile.hidden > * {
    opacity: 0.4;
    filter: grayscale(1);
  }

  /* The card at the tile's left, the picture's room right by it. Content in flow, so the tile grows to fit instead of
     clipping the card. Sizes follow the window, not the tile: every banner on the page has the same card. */
  .content {
    z-index: 1;
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center; /* (the card in the middle of a tile taller than it) */
    padding: var(--inset);
  }

  /* Ruled like the site's blocks, legible on any picture, its corners nested in the tile's (the tile's radius less
     the inset). */
  .panel {
    position: relative;
    z-index: 1; /* (over a picture running under it) */
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(0.625rem, 0.35rem + 0.75vw, 1rem);
    max-width: clamp(13rem, 8rem + 14vw, 24rem);
    /* never narrower than its longest word: no word is broken (a hyphenated one left the card a hole beside it) */
    min-width: min-content;
    padding: var(--pad-y) clamp(1rem, 0.5rem + 1.2vw, 1.5rem);
    border: var(--rule);
    border-radius: max(0.75rem, calc(var(--tile-r) - var(--inset)));
    corner-shape: squircle;
    background-color: var(--paper);
  }
  .title {
    color: var(--ink);
    font-size: clamp(1.25rem, 0.95rem + 0.95vw, 1.875rem);
    line-height: 1.06;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }
  .subtitle {
    margin-top: 0.4em;
    color: var(--ink-600);
    font-size: clamp(0.875rem, 0.75rem + 0.4vw, 1.1875rem);
    line-height: 1.25;
    overflow-wrap: break-word;
  }
  .line {
    display: block;
  }
  /* small: the whole banner is the link, the button only says so */
  .button {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4em 0.85em;
    border: 2px solid var(--ink);
    border-radius: var(--r-pill);
    corner-shape: squircle;
    background-color: var(--ink);
    color: #fff;
    font-size: clamp(0.75rem, 0.7rem + 0.15vw, 0.875rem);
    font-weight: 600;
    white-space: nowrap;
    transition:
      background-color var(--dur) var(--ease-hover),
      border-color var(--dur) var(--ease-hover);
  }
  .tile.href:hover .button {
    border-color: var(--red);
    background-color: var(--red);
  }

  /* The picture's room: beside the card (`side`), from its edge to the tile's top, right and bottom edges, or the
     whole tile under the card (`full`); with a margin (for a picture with no room of its own round it) in from those
     edges and the card by half the card's padding. In it the picture is centred, covering it or contained in it (whole, a
     soft shadow under it). The room doesn't size the tile (absolute) and cuts nothing: a covering picture runs on past
     it, under the card, cut only by the tile's edges. */
  .picture {
    position: relative;
    align-self: stretch;
    min-width: 0;
  }
  .full {
    z-index: 0; /* (under the card) */
    position: absolute;
    inset: 0;
  }
  .fit {
    position: absolute;
    inset: calc(-1 * var(--inset)) calc(-1 * var(--inset)) calc(-1 * var(--inset)) 0;
  }
  .margin .fit {
    --out: calc(var(--margin) - var(--inset));
    inset: var(--out) var(--out) var(--out) var(--margin);
  }
  .full .fit {
    inset: 0;
  }
  .full.margin .fit {
    inset: var(--margin);
  }
  .fit img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 0.5rem 0.9rem rgb(27 47 78 / 0.2));
  }
  /* covering: until its proportions are known, cut by the room; then as big as covering the room takes, centred on it */
  .cover .fit {
    container-type: size;
  }
  .cover .fit img {
    object-fit: cover;
    filter: none;
  }
  .cover .fit.sized img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: max(100cqw, 100cqh * var(--ratio));
    height: auto;
    max-width: none;
    translate: -50% -50%;
  }

  /* A narrow tile (a phone's, a half tile on a tablet): the picture's room under the card, as wide as the tile and
     16:9, from the card's foot to the tile's sides and foot (with a margin, inset from them a little more: most of the
     card's padding) - beside it there'd be no room left. The card no wider than the tile, a word too long for it
     hyphenated (broken only where it can't be); its button only its arrow, in its top right corner, so the card is
     shorter. */
  @container (max-width: 29.99rem) {
    .content {
      --margin: calc(var(--pad-y) * 0.8); /* (the tile is the container: its content takes it) */
      grid-template-columns: minmax(0, 1fr);
      align-items: start;
    }
    .panel {
      justify-self: start;
      min-width: 0;
      max-width: 100%;
    }
    .panel.arrowed {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      column-gap: var(--sp-3);
    }
    .title {
      hyphens: auto;
      overflow-wrap: break-word;
    }
    .button {
      padding: 0.3rem;
      font-size: 0.9375rem;
    }
    .button__text {
      display: none;
    }
    .picture {
      z-index: auto;
      position: relative;
      inset: auto;
      aspect-ratio: 16 / 9;
    }
    .fit,
    .full .fit {
      inset: 0 calc(-1 * var(--inset)) calc(-1 * var(--inset));
    }
    .margin .fit,
    .full.margin .fit {
      --out: calc(var(--margin) - var(--inset));
      inset: var(--margin) var(--out) var(--out);
    }
  }

  /* The picked banner's handles, in the admin's navy, each a pill across the middle of a side: the arrow pointing
     out outside the edge, the one pointing in inside it; one with nowhere to go not there (a side with neither, no
     pill). */
  .handles {
    z-index: 6; /* (over its block's frame, see Element) */
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .handle {
    position: absolute;
    display: flex;
    overflow: hidden;
    border: 2px solid #fff;
    border-radius: 0.75rem;
    corner-shape: squircle;
    background-color: var(--navy);
    box-shadow: 0 0.15rem 0.5rem rgb(14 27 47 / 0.35);
    pointer-events: auto;
  }
  .handle.top {
    top: 0;
    left: 50%;
    flex-direction: column;
    translate: -50% -50%;
  }
  .handle.bottom {
    bottom: 0;
    left: 50%;
    flex-direction: column-reverse;
    translate: -50% 50%;
  }
  .handle.left {
    top: 50%;
    left: 0;
    translate: -50% -50%;
  }
  .handle.right {
    top: 50%;
    right: 0;
    flex-direction: row-reverse;
    translate: 50% -50%;
  }
  .handle button {
    cursor: pointer;
    display: grid;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border: 0;
    background-color: transparent;
    color: #fff;
    transition: background-color var(--dur-fast) var(--ease-hover);
  }
  .handle button:hover {
    background-color: rgb(255 255 255 / 0.18);
  }
  .handle button:focus-visible {
    outline: 2px solid #fff;
    outline-offset: -4px;
  }

  /* Its moves: big arrows in the admin's navy, outlined white, each by the middle of its side, its tip a little way
     (--gap) in from the handle there (--reach, see sides) - every side alike; only those it can make,
     there while it's pointed at or one of them has the focus: typing in the panel, the banner shows as it is. */
  .moves {
    --gap: 0.5rem;
    --tip: 0.23rem; /* (the arrow's tip, outline and all, from its box's edge) */
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity var(--dur) var(--ease-hover);
  }
  .wrapper:hover .moves,
  .moves:focus-within {
    opacity: 1;
  }
  .wrapper:hover .move,
  .move:focus-visible {
    pointer-events: auto;
  }
  .move {
    --in: calc(var(--reach) + var(--gap) - var(--tip)); /* (its own: its side's reach) */
    position: absolute;
    cursor: pointer;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    background: none;
    color: var(--navy);
    pointer-events: none;
    transition: color var(--dur-fast) var(--ease-hover);
  }
  .move svg {
    width: 2.6rem;
    height: 2.6rem;
    overflow: visible;
    filter: drop-shadow(0 0.1rem 0.3rem rgb(14 27 47 / 0.4));
  }
  .move path {
    fill: currentColor;
    stroke: #fff;
    stroke-width: 1.5;
    stroke-linejoin: round;
  }
  /* lit up as the handles' buttons are */
  .move:hover {
    color: color-mix(in oklab, var(--navy), #fff 18%);
  }
  .move:focus-visible {
    outline: 2px solid var(--navy);
    outline-offset: 0;
    border-radius: 0.5rem;
  }
  .move.top {
    top: var(--in);
    left: 50%;
    translate: -50% 0;
  }
  .move.top svg {
    rotate: -90deg;
  }
  .move.right {
    top: 50%;
    right: var(--in);
    translate: 0 -50%;
  }
  .move.bottom {
    bottom: var(--in);
    left: 50%;
    translate: -50% 0;
  }
  .move.bottom svg {
    rotate: 90deg;
  }
  .move.left {
    top: 50%;
    left: var(--in);
    translate: 0 -50%;
  }
  .move.left svg {
    rotate: 180deg;
  }
</style>
