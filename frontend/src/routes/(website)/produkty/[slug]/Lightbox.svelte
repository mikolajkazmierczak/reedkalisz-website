<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { baseUrl } from '$/api';
  import Icon from '$c/Icon.svelte';
  import Color from '#c/Color.svelte';
  import { parseColor } from '#/utils';

  // imgs: [{ img, variant? }], variant = { code, first, second }
  export let imgs;
  export let index;
  export let label; // (i) -> the photo's alt text

  const dispatch = createEventDispatcher();
  const src = (img) => `${baseUrl}/assets/${img}`;
  const close = () => dispatch('close', index);

  $: current = imgs[index];
  $: variant = current?.variant;
  $: several = imgs.length > 1;
  const go = (step) => (index = (index + step + imgs.length) % imgs.length);

  // the neighbours loaded ahead, so the crossfade has both photos
  $: if (several)
    for (const i of [index - 1, index + 1]) new Image().src = src(imgs[(i + imgs.length) % imgs.length].img);

  function keydown(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft' && several) go(-1);
    else if (e.key === 'ArrowRight' && several) go(1);
    else if (e.key === 'Tab') {
      // aria-modal: Tab goes round the dialog, not into the page behind
      const stops = [...dialog.querySelectorAll('button:not([tabindex="-1"])')];
      const i = stops.indexOf(document.activeElement);
      if (e.shiftKey ? i <= 0 : i === -1 || i === stops.length - 1) stops.at(e.shiftKey ? -1 : 0).focus();
      else return;
    } else return;
    e.preventDefault();
  }

  // The variant's pill keeps the last one while it fades away, and grows or shrinks to the next one's width.
  let shown = null;
  $: if (variant && variant !== shown) shown = variant;
  let variantWidth = 0;

  const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth');

  // the picked photo in the middle of the strip: already there when it opens, then scrolled to
  let strip;
  let opened = false;
  $: if (strip) center(index);
  async function center(i) {
    await tick();
    const thumb = strip?.children[i];
    if (!thumb) return;
    const left = thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2;
    strip.scrollTo({ left, behavior: opened ? smooth() : 'instant' });
    opened = true;
    edges();
  }

  // arrows at its ends while it can scroll that way, a few photos a click
  let canLeft = false;
  let canRight = false;
  function edges() {
    if (!strip) return;
    canLeft = strip.scrollLeft > 1;
    canRight = strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1;
  }
  function slide(direction) {
    const thumb = strip.children[0];
    strip.scrollBy({
      left: direction * 3 * (thumb.offsetWidth + parseFloat(getComputedStyle(strip).columnGap)),
      behavior: smooth(),
    });
  }

  // A layer per photo, shown once loaded: it crossfades over the last while both ease to its size,
  // on a white plate so the dark doesn't show through mid-fade.
  let stageW = 0;
  let stageH = 0;
  let layers = []; // [{ id, src, alt, natural }], the newest last
  let serial = 0;
  $: if (layers.at(-1)?.src !== src(current.img))
    layers = [...layers, { id: ++serial, src: src(current.img), alt: label(index), natural: null }];
  // counts once loaded (a cached one at once); a broken one as a square, so the count and pill don't outrun it
  function measured(node, layer) {
    const take = () => {
      layer.natural = node.naturalWidth ? [node.naturalWidth, node.naturalHeight] : [stageH || 1, stageH || 1];
      layers = [...layers];
    };
    node.getBoundingClientRect(); // laid out at the last size first, so it eases from there
    if (node.complete) take();
    else {
      node.addEventListener('load', take, { once: true });
      node.addEventListener('error', take, { once: true });
    }
  }
  $: showing = layers.findLast((l) => l.natural);
  let size = null;
  $: if (showing && stageW) {
    const [w, h] = showing.natural;
    const fit = Math.min(1, stageW / w, stageH / h);
    size = [w * fit, h * fit];
  }
  // the older ones go once a newer one has faded in over them (each on its own timer: fast steps don't postpone it)
  const sweeps = new Set();
  let kept;
  $: if (showing !== kept) sweepUnder((kept = showing));
  function sweepUnder(layer) {
    const sweep = setTimeout(() => {
      sweeps.delete(sweep);
      layers = layers.filter((l) => l.id >= layer.id);
    }, 400);
    sweeps.add(sweep);
  }
  let eased = false; // the first photo's size taken at once, then eased from photo to photo
  $: if (size && !eased) tick().then(() => (eased = true));

  // Each part fades on its own (--t): under a see-through ancestor, backdrop-filter stops blurring.
  const appear = (node) => ({
    duration: 200,
    tick: (t) => {
      node.style.setProperty('--t', t);
      node.classList.toggle('appearing', t < 1); // (their own transitions would lag behind)
    },
  });

  // swipe left: next photo; right: previous
  let touch = null;
  function swipeStart(e) {
    touch = e.touches.length === 1 ? [e.touches[0].clientX, e.touches[0].clientY] : null;
  }
  function swipeEnd(e) {
    if (!touch || !several) return;
    const dx = e.changedTouches[0].clientX - touch[0];
    const dy = e.changedTouches[0].clientY - touch[1];
    touch = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < 1.5 * Math.abs(dy)) return;
    e.preventDefault(); // (not a tap: it doesn't close)
    go(dx < 0 ? 1 : -1);
  }

  let dialog;
  onMount(() => {
    dialog.focus();
    // the page stays put behind it
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      sweeps.forEach(clearTimeout);
      document.documentElement.style.overflow = overflow;
    };
  });
</script>

<svelte:window on:keydown={keydown} on:resize={() => center(index)} />

<div
  class="lightbox"
  role="dialog"
  aria-modal="true"
  aria-label="Zdjęcia produktu"
  tabindex="-1"
  bind:this={dialog}
  transition:appear>
  <div class="pills">
    {#if several}
      <span class="pill count" style:width="{String(imgs.length).length * 2 + 5}ch" aria-hidden="true">
        {index + 1}&nbsp;/&nbsp;{imgs.length}
      </span>
    {/if}
    <!-- +2: its borders -->
    <span
      class="pill variant"
      class:hidden={!variant}
      style:width={variant ? `min(${variantWidth + 2}px, 100vw - 9rem)` : '0'}>
      {#if shown}
        {#key shown}
          <span class="variant__content" bind:offsetWidth={variantWidth} transition:fade={{ duration: 200 }}>
            <Color first={shown.first} second={shown.second} size="1.25rem" notooltip />
            <span class="variant__text">
              <small>{shown.code}</small>
              <span>{parseColor(shown.first, shown.second).label}</span>
            </span>
          </span>
        {/key}
      {/if}
    </span>
  </div>

  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions (Escape and × close too) -->
  <div
    class="stage"
    bind:clientWidth={stageW}
    bind:clientHeight={stageH}
    on:click={close}
    on:touchstart|passive={swipeStart}
    on:touchend|nonpassive={swipeEnd}>
    <div class="plate" class:eased style:width="{size?.[0] ?? 0}px" style:height="{size?.[1] ?? 0}px" />
    {#each layers as layer (layer.id)}
      <img
        class="photo"
        class:eased
        class:shown={layer === showing}
        src={layer.src}
        alt={layer === showing ? layer.alt : ''}
        draggable="false"
        style:width="{size?.[0] ?? 0}px"
        style:height="{size?.[1] ?? 0}px"
        use:measured={layer} />
    {/each}
  </div>

  <button class="pill arrow arrow--small close" type="button" aria-label="Zamknij" on:click={close}>
    <Icon name="close" color="currentColor" width="1.25rem" height="1.25rem" />
  </button>

  {#if several}
    <button class="pill arrow arrow--prev" type="button" aria-label="Poprzednie zdjęcie" on:click={() => go(-1)}>
      <Icon name="chevron_left" color="currentColor" width="1.75rem" height="1.75rem" />
    </button>
    <button class="pill arrow arrow--next" type="button" aria-label="Następne zdjęcie" on:click={() => go(1)}>
      <Icon name="chevron_right" color="currentColor" width="1.75rem" height="1.75rem" />
    </button>

    <div class="strip-wrap">
      <div class="strip" bind:this={strip} on:scroll={edges}>
        {#each imgs as { img }, i}
          <button
            class="thumb"
            class:picked={i === index}
            type="button"
            aria-label={label(i)}
            aria-current={i === index}
            on:click={() => (index = i)}>
            <img src={src(img)} alt="" loading="lazy" decoding="async" draggable="false" />
          </button>
        {/each}
      </div>
      <button
        class="pill arrow arrow--small arrow--prev"
        class:gone={!canLeft}
        type="button"
        tabindex="-1"
        aria-label="Przewiń w lewo"
        on:click={() => slide(-1)}>
        <Icon name="chevron_left" color="currentColor" width="1.25rem" height="1.25rem" />
      </button>
      <button
        class="pill arrow arrow--small arrow--next"
        class:gone={!canRight}
        type="button"
        tabindex="-1"
        aria-label="Przewiń w prawo"
        on:click={() => slide(1)}>
        <Icon name="chevron_right" color="currentColor" width="1.25rem" height="1.25rem" />
      </button>
    </div>
  {/if}
</div>

<style>
  /* pills, photo, strip: the same space around them all, the arrows' distance from the sides */
  .lightbox {
    --edge: var(--sp-4);
    --pill: 2.75rem; /* the pills' height */
    --small: 2.25rem; /* × and the strip's chevrons */
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    flex-direction: column;
    gap: var(--edge);
    padding: var(--edge);
    background-color: color-mix(in srgb, var(--ink) calc(82% * var(--t, 1)), transparent);
    color: #fff;
    outline: none;
  }
  button {
    margin: 0;
    padding: 0;
  }

  .stage {
    position: relative;
    flex: 1;
    min-height: 0;
    cursor: zoom-out;
    touch-action: pinch-zoom; /* sideways is a swipe */
  }
  .stage,
  .strip,
  .pill {
    opacity: var(--t, 1);
  }
  .lightbox:global(.appearing) * {
    transition: none !important;
  }
  .plate,
  .photo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 1.5rem;
    corner-shape: squircle;
    background-color: #fff;
  }
  .photo {
    max-width: none;
    /* the box has the photo's shape at rest; mid-crossfade both photos fill it as it eases */
    object-fit: cover;
    opacity: 0;
    transition: opacity 350ms;
  }
  .photo.shown {
    opacity: 1;
  }
  .plate.eased,
  .photo.eased {
    transition:
      opacity 350ms,
      width 350ms,
      height 350ms;
  }

  .pill {
    border: 1px solid rgb(255 255 255 / 0.2);
    background-color: rgb(255 255 255 / 0.12);
    -webkit-backdrop-filter: blur(0.75rem) saturate(1.4);
    backdrop-filter: blur(0.75rem) saturate(1.4);
  }

  .pills {
    pointer-events: none;
    flex: none;
    display: flex;
    justify-content: center;
    height: var(--pill);
  }
  .pills .pill {
    display: flex;
    align-items: center;
    border-radius: 100rem;
    font-size: var(--fs-sm);
    white-space: nowrap;
  }
  .count {
    justify-content: center;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
  .pills .variant {
    display: grid;
    overflow: hidden;
    transition:
      width 250ms ease,
      margin 250ms ease,
      opacity 200ms,
      transform 200ms;
  }
  .count + .variant {
    margin-left: var(--sp-2);
  }
  .variant.hidden {
    margin-left: 0;
    opacity: 0;
    transform: translateY(-0.5rem);
  }
  .variant__content {
    grid-area: 1 / 1; /* the next one fades in over the last */
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    width: max-content;
    padding: 0 var(--sp-4) 0 var(--sp-3);
  }
  .variant__text {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }
  .variant__text small {
    font-size: var(--fs-label);
    letter-spacing: 0.04em;
    opacity: 0.75;
  }
  .variant__text span {
    font-weight: 600;
  }

  .arrow {
    cursor: pointer;
    z-index: 1;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: grid;
    place-items: center;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 1.25rem;
    corner-shape: squircle;
    transition:
      background-color 150ms,
      opacity 150ms;
  }
  .arrow--small {
    width: var(--small);
    height: var(--small);
    border-radius: 0.875rem;
  }
  .arrow.gone {
    pointer-events: none;
    opacity: 0;
  }
  /* the strip's, over its white tiles: dark glass */
  .strip-wrap .arrow {
    background-color: rgb(17 17 16 / 0.45);
  }
  @media (hover: hover) {
    .arrow:hover {
      background-color: rgb(255 255 255 / 0.22);
    }
    .strip-wrap .arrow:hover {
      background-color: rgb(17 17 16 / 0.6);
    }
  }
  .arrow:focus-visible,
  .thumb:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
  .arrow--prev {
    left: var(--edge);
  }
  .arrow--next {
    right: var(--edge);
  }
  /* ×: as far in as the strip's chevrons, level with the pills */
  .close {
    top: calc(var(--edge) + (var(--pill) - var(--small)) / 2);
    right: calc(2 * var(--edge));
    transform: none;
  }
  /* the strip's: twice as far in, over its tiles */
  .arrow--small.arrow--prev {
    left: calc(2 * var(--edge));
  }
  .arrow--small.arrow--next {
    right: calc(2 * var(--edge));
  }

  .strip-wrap {
    --ring: 0.375rem; /* room for the picked tile's outline */
    position: relative;
    flex: none;
    margin: calc(-1 * var(--ring)) calc(-1 * var(--edge)) 0;
  }
  .strip {
    position: relative;
    display: flex;
    gap: var(--sp-3);
    padding: var(--ring) calc(var(--edge) + var(--ring));
    overflow-x: auto;
    scrollbar-width: none;
  }
  .thumb {
    cursor: pointer;
    flex: none;
    width: 4rem;
    height: 4rem;
    padding: var(--sp-1);
    border: none;
    border-radius: 1rem;
    corner-shape: squircle;
    background-color: #fff;
    opacity: 0.5;
    transition: opacity 150ms;
  }
  /* centred while they fit; once they don't, from the start (not overflowing out of reach on the left) */
  .thumb:first-child {
    margin-left: auto;
  }
  .thumb:last-child {
    margin-right: auto;
  }
  .thumb.picked {
    opacity: 1;
    outline: 0.25rem solid var(--blue);
    outline-offset: 0.125rem;
  }
  @media (hover: hover) {
    .thumb:hover {
      opacity: 1;
    }
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* a phone: no arrows (the strip is swiped and tapped), the pills as tall as × */
  @media (max-width: 47.4988rem) {
    .arrow:not(.close) {
      display: none;
    }
    .lightbox {
      --edge: var(--sp-2);
      --pill: var(--small);
    }
    .pills {
      justify-content: flex-start;
    }
    .thumb {
      width: 3.25rem;
      height: 3.25rem;
    }
  }
</style>
