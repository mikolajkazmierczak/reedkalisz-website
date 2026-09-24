<script>
  import { parseColor } from '#/utils';
  import Color from '#c/Color.svelte';
  import Badges from '#c/badges/Badges.svelte';
  import ProductColorTooltip from '#/products/ProductColorTooltip.svelte';
  import { productImages } from '#/products/images';

  export let product;
  $: ({
    name,
    code,
    slug,
    new: isNew,
    sale,
    bestseller,
    coming_soon,
    out_of_stock,
    price_min,
    price_min_sale,
    storage,
  } = product);

  /** Whether the lowest price includes marking: labeling prices always do, custom ones when flagged. */
  function includesMarking({ price_min, custom_prices, custom_prices_sale, custom_prices_with_labeling, labelings }) {
    const has = (prices) => prices.some((p) => p.enabled && p.price === price_min);
    if (has([...custom_prices, ...custom_prices_sale])) return !!custom_prices_with_labeling;
    return labelings.some((l) => has([...l.prices, ...l.prices_sale]));
  }
  $: withMarking = !!price_min && includesMarking(product);

  $: [src, hoverSrc] = productImages(product);

  // Images stack; a new one fades in over the old once it has loaded, then the old is dropped.
  let layers = [];
  let layerId = 0;
  $: stack(src);
  function stack(src) {
    if (!src) layers = [];
    else if (layers.at(-1)?.src !== src) layers = [...layers.slice(-2), { src, id: ++layerId, ready: !layers.length }];
  }
  function reveal(layer, node) {
    if (layer.ready) return;
    // Commit its zero opacity first, so even a cached picture fades in.
    getComputedStyle(node).opacity;
    layer.ready = true;
    layers = layers;
  }
  function settle() {
    const top = layers.at(-1);
    if (top?.ready && layers.length > 1) layers = [top];
  }
  /** Settled (loaded or failed), even when it came from the cache before the listener was attached. */
  function onLoad(node, done) {
    const settled = () => done(node);
    if (node.complete) return settled();
    node.addEventListener('load', settled, { once: true });
    node.addEventListener('error', settled, { once: true });
  }

  // The second picture only loads on the first hover.
  let hovered = false;
  let hoverReady = false;
  $: hoverSrc, (hoverReady = false);

  // Disabled variants are hidden even from admins.
  $: colors = storage
    .filter((s) => s.enabled)
    .map(({ multicolored, color_first, color_second, amount, available }) => ({
      multicolored,
      first: color_first,
      second: color_second,
      amount,
      available,
    }));
  $: shownColors = colors.slice(0, 6);
  $: extraColors = colors.length - shownColors.length;
  $: colorsHovers = colors.map(() => false);

  // The whole card is the link: a click on a swatch (which keeps the pointer for its tooltip) goes to it too.
  let link;
  function forwardToLink(e) {
    if (!link.contains(e.target)) link.dispatchEvent(new MouseEvent('click', e));
  }

  function handleHoverChange(hover, i) {
    colorsHovers[i] = hover;
  }
</script>

<!-- Tooltips live outside the card: its transform breaks their positioning. -->
{#each shownColors as { multicolored, first, second, amount, available }, i}
  {@const { label } = parseColor(multicolored, first, second)}
  <ProductColorTooltip {label} {amount} {available} show={colorsHovers[i]} />
{/each}

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<article
  on:click={forwardToLink}
  on:pointerenter={(e) => e.pointerType === 'mouse' && (hovered = true)}
  class="tile"
  class:is-out={out_of_stock}
  class:t-sale={sale}
  class:t-new={isNew}
  class:t-best={bestseller}
  class:t-soon={coming_soon}>
  <a class="tile__link" href="/produkty/{slug}" bind:this={link}>
    <div class="tile__media">
      {#each layers as layer (layer.id)}
        {@const last = layer === layers.at(-1)}
        <img
          class="tile__img"
          class:shown={layer.ready && (last || !layers.at(-1).ready)}
          src={layer.src}
          alt={last ? name : ''}
          loading="lazy"
          decoding="async"
          use:onLoad={(node) => reveal(layer, node)}
          on:transitionend={settle} />
      {:else}
        <div class="tile__none" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" />
            <path d="m3 16 5-5 4 4 3-3 6 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      {/each}
      {#if hoverSrc && hovered}
        {#key hoverSrc}
          <img
            class="tile__img tile__img--hover"
            class:ready={hoverReady}
            src={hoverSrc}
            alt=""
            decoding="async"
            use:onLoad={() => (hoverReady = true)} />
        {/key}
      {/if}

      <Badges {isNew} {bestseller} {sale} {coming_soon} {out_of_stock} />
    </div>

    <div class="tile__body">
      <h3 class="tile__name">{name}</h3>
      <p class="code tile__code">{code}</p>
    </div>
  </a>

  <div class="tile__foot">
    <!-- Always rendered, so rows without colours keep the same height. -->
    <div class="tile__colors">
      {#each shownColors as { multicolored, first, second, amount, available }, i}
        <Color
          {multicolored}
          {first}
          {second}
          {amount}
          {available}
          notooltip
          onhoverchange={(hover) => handleHoverChange(hover, i)} />
      {/each}
      {#if extraColors > 0}
        <span class="tile__more tnum">+{extraColors}</span>
      {/if}
    </div>

    <div class="tile__price">
      <p class="tile__amount">
        {#if price_min}
          <span class="from">od</span>
          {#if price_min_sale}
            <s class="was tnum">{price_min.toFixed(2)}</s>
            <strong class="now now--sale tnum">{price_min_sale.toFixed(2)} zł</strong>
          {:else}
            <strong class="now tnum" class:now--long={price_min >= 100}>{price_min.toFixed(2)} zł</strong>
          {/if}
          <span class="per">/szt</span>
        {:else}
          <span class="ask">Zapytaj o cenę</span>
        {/if}
      </p>
      <!-- Always rendered, so prices line up whether or not it's said. -->
      <p class="tile__with">{#if withMarking}ze znakowaniem{/if}</p>
    </div>
  </div>
</article>

<style>
  .tile {
    --edge: var(--border);
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--edge);
    overflow: hidden;
    background-color: var(--surface);
    box-shadow: 0 0 0 0 var(--edge);
    transition:
      border-color var(--dur-fast) var(--ease),
      box-shadow var(--dur-fast) var(--ease),
      background-color var(--dur-fast) var(--ease);
  }
  .tile.t-soon {
    --edge: var(--ink-400);
  }
  .tile.t-best {
    --edge: var(--navy);
  }
  .tile.t-new {
    --edge: var(--purple);
  }
  .tile.t-sale {
    --edge: var(--orange);
  }
  /* Hover thickens via an outer ring, so the contents don't shift. */
  .tile:hover {
    --edge: var(--ink);
    box-shadow: 0 0 0 1px var(--edge);
  }
  .tile.is-out {
    background-color: var(--paper-2);
  }

  .tile__link {
    display: flex;
    flex-direction: column;
    color: inherit;
  }
  .tile__link::after {
    content: '';
    position: absolute;
    inset: 0;
  }
  .tile__link:focus-visible {
    outline: none;
  }
  .tile__link:focus-visible::after {
    outline: 3px solid var(--red);
    outline-offset: -3px;
  }

  .tile__media {
    flex: none;
    position: relative;
    aspect-ratio: 1 / 1;
    padding: var(--sp-3);
    border-bottom: 1px solid var(--border);
    background-color: #fff;
    overflow: hidden;
    /* Every picture shares one cell, so a new one fades in over the old without moving anything. */
    display: grid;
    grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  }
  .tile__img,
  .tile__none {
    grid-area: 1 / 1;
  }
  .tile__img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0;
    transition: opacity calc(var(--dur) * 1.5) var(--ease);
  }
  .tile__img.shown {
    opacity: 1;
  }
  .tile__img--hover {
    background-color: #fff;
  }
  .tile:hover .tile__img--hover.ready {
    opacity: 1;
  }
  .is-out .tile__img {
    filter: grayscale(1);
  }
  .is-out .tile__img.shown {
    opacity: 0.5;
  }
  @media (prefers-reduced-motion: reduce) {
    .tile__img {
      transition: none;
    }
  }
  .tile__none {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    color: var(--paper-4);
  }
  .tile__none svg {
    width: 32%;
  }

  .tile__body {
    padding: var(--sp-3) var(--sp-3) var(--sp-2);
  }
  /* Two lines reserved so grid rows line up. */
  .tile__name {
    font-size: 0.9375rem;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.015em;
    min-height: calc(2 * 1.25em);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .tile__code {
    margin-top: var(--sp-1);
  }

  .tile__foot {
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
    margin-top: auto;
    padding: 0 var(--sp-3) var(--sp-3);
  }

  /* Above the link's overlay for the swatch tooltips, but only the swatches take the pointer. */
  .tile__colors {
    position: relative;
    z-index: 1;
    pointer-events: none;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.25rem;
    height: 1.25rem;
    overflow: hidden;
  }
  /* One swatch tall and no wrap: overflow is cut by "+N". */
  .tile__colors > :global(*) {
    flex: none;
    pointer-events: auto;
  }
  .tile__more {
    color: var(--ink-400);
    font-size: var(--fs-xs);
  }

  .tile__price {
    container-type: inline-size;
    padding-top: var(--sp-2);
    border-top: 1px solid var(--paper-3);
  }
  /* One height at every price size, set on the bottom, so the rows line up. */
  .tile__amount {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    align-content: flex-end;
    min-height: 2.25rem;
    gap: 0.3em;
  }
  .tile__with {
    min-height: 1lh;
    color: var(--ink-500);
    font-size: 0.6875rem;
    font-weight: 700;
    line-height: 1.3;
  }
  .from {
    color: var(--ink-400);
    font-size: var(--fs-xs);
  }
  .now {
    font-size: 1.4375rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .now--sale {
    color: var(--red);
  }
  /* On narrow cards the longer lines step down to stay on one line: three-digit prices, and sales with two. */
  @container (width < 10rem) {
    .now--long {
      font-size: 1.3125rem;
    }
    .now--sale {
      font-size: 1.0625rem;
    }
  }
  .was {
    color: var(--ink-400);
    font-size: var(--fs-sm);
  }
  .per {
    margin-left: -0.2em;
    color: var(--ink-500);
    font-size: var(--fs-sm);
  }
  .ask {
    color: var(--ink-600);
    font-size: var(--fs-sm);
    font-weight: 600;
  }

  @media (min-width: 35rem) {
    .tile__media {
      padding: var(--sp-4);
    }
    .tile__body {
      padding: var(--sp-4) var(--sp-4) var(--sp-2);
    }
    .tile__foot {
      padding: 0 var(--sp-4) var(--sp-4);
    }
  }
</style>
