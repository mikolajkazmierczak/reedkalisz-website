<script>
  import { baseUrl } from '$/api';
  import { parseColor } from '#/utils';
  import Color from '#c/Color.svelte';
  import Badges from '#c/badges/Badges.svelte';
  import ProductColorTooltip from '#/products/ProductColorTooltip.svelte';

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
    custom_prices_with_labeling,
    custom_prices,
    custom_prices_sale,
    labelings,
    storage,
    gallery,
  } = product);

  function getPriceType(price, custom_prices, custom_prices_sale, labelings) {
    for (const p of custom_prices.concat(custom_prices_sale)) {
      if (p.enabled && p.price === price) return 'custom';
    }
    for (const l of labelings) {
      for (const p of l.prices.concat(l.prices_sale)) {
        if (p.enabled && p.price === price) return 'labeling';
      }
    }
    return 'none';
  }

  function getImgs(gallery, storage) {
    const imgs = [];
    for (const { enabled, img } of gallery) {
      if (enabled && img) imgs.push({ src: `${baseUrl}/assets/${img}?key=medium` });
    }
    for (const s of storage.filter((s) => s.enabled)) {
      for (const { enabled, img } of s.img) {
        if (enabled && img) imgs.push({ src: `${baseUrl}/assets/${img}?key=medium` });
      }
    }
    return imgs;
  }

  $: imgs = getImgs(gallery, storage);
  $: img = imgs[0];

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

  $: priceType = getPriceType(price_min, custom_prices, custom_prices_sale, labelings);
  $: pricesWithLabeling = priceType !== 'none' && (priceType === 'labeling' || custom_prices_with_labeling);

  function handleHoverChange(hover, i) {
    colorsHovers[i] = hover;
  }
</script>

<!-- Tooltips live outside the card: its transform breaks their positioning. -->
{#if shownColors.length}
  {#each shownColors as { multicolored, first, second, amount, available }, i}
    {@const { label } = parseColor(multicolored, first, second)}
    <ProductColorTooltip {label} {amount} {available} show={colorsHovers[i]} />
  {/each}
{/if}

<article
  class="tile"
  class:is-out={out_of_stock}
  class:t-sale={sale}
  class:t-new={isNew}
  class:t-best={bestseller}
  class:t-soon={coming_soon}>
  <a class="tile__link" href="/produkty/{slug}">
    <div class="tile__media">
      {#if img}
        <img src={img.src} alt={name} loading="lazy" decoding="async" />
      {:else}
        <div class="tile__none" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" />
            <path d="m3 16 5-5 4 4 3-3 6 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
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
      {#if price_min}
        <span class="from">od</span>
        {#if price_min_sale}
          <s class="was tnum">{price_min.toFixed(2)}</s>
          <strong class="now now--sale tnum">{price_min_sale.toFixed(2)} zł</strong>
        {:else}
          <strong class="now tnum">{price_min.toFixed(2)} zł</strong>
        {/if}
        <span class="unit">{pricesWithLabeling ? 'netto/szt ze znakowaniem' : 'netto/szt'}</span>
      {:else}
        <span class="ask">Zapytaj o cenę</span>
      {/if}
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
  }
  .tile__media img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .is-out .tile__media img {
    opacity: 0.5;
    filter: grayscale(1);
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

  .tile__colors {
    position: relative;
    z-index: 1;
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
  }
  .tile__more {
    color: var(--ink-400);
    font-size: var(--fs-xs);
  }

  .tile__price {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35em;
    padding-top: var(--sp-2);
    border-top: 1px solid var(--paper-3);
  }
  .from {
    color: var(--ink-400);
    font-size: var(--fs-xs);
  }
  .now {
    font-size: 1.0625rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .now--sale {
    color: var(--red);
  }
  .was {
    color: var(--ink-400);
    font-size: var(--fs-sm);
  }
  .unit {
    flex: 1 1 100%;
    color: var(--ink-400);
    font-size: var(--fs-xs);
    line-height: 1.3;
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
