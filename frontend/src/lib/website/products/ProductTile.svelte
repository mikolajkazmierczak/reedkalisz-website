<script>
  import { fly } from 'svelte/transition';

  import { baseUrl } from '$/api';
  import { parseColor } from '#/utils';
  import Color from '#c/Color.svelte';
  import AdminOnlyOverlay from '#c/AdminOnlyOverlay.svelte';
  import SaleBadge from '#c/badges/SaleBadge.svelte';
  import NewBadge from '#c/badges/NewBadge.svelte';
  import BestsellerBadge from '#c/badges/BestsellerBadge.svelte';
  import ComingSoonBadge from '#c/badges/ComingSoonBadge.svelte';
  import OutOfStockBadge from '#c/badges/OutOfStockBadge.svelte';
  import ProductColorTooltip from '#/products/ProductColorTooltip.svelte';

  export let product;
  $: ({
    name,
    code,
    slug,
    enabled,
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
    gallery
  } = product);

  function getPriceType(price, custom_prices, custom_prices_sale, labelings) {
    // find price in custom_prices, custom_prices_sale, labelings.prices or labelings.prices_sale
    // return 'custom', 'labeling' or 'none'
    // note: for now this is actually safe, because custom and labelings prices cannot be mixed
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
      if (enabled) imgs.push({ enabled, src: `${baseUrl}/assets/${img}?key=medium` });
    }
    for (const s of storage) {
      for (const { enabled, img } of s.img) {
        if (enabled) imgs.push({ enabled, src: `${baseUrl}/assets/${img}?key=medium` });
      }
    }
    return imgs;
  }

  function setImg(i) {
    if (!imgs.length) return;
    img = imgs[i];
  }

  let img;
  $: imgs = getImgs(gallery, storage);
  $: imgs && setImg(0);

  $: colors = storage.map(({ multicolored, color_first, color_second, amount, enabled }) => {
    return { multicolored, first: color_first, second: color_second, amount, enabled };
  });
  $: colorsHovers = colors.map(() => false);

  $: priceType = getPriceType(price_min, custom_prices, custom_prices_sale, labelings);
  $: pricesWithLabeling = priceType !== 'none' && (priceType === 'labeling' || custom_prices_with_labeling);

  function handleHoverChange(hover, i) {
    colorsHovers[i] = hover;
  }
</script>

<!-- workaround for tooltips not working because of transform property on .tile -->
{#if colors.length}
  {#each colors as { multicolored, first, second, amount }, i}
    {@const { label } = parseColor(multicolored, first, second)}
    <ProductColorTooltip {label} {amount} show={colorsHovers[i]} />
  {/each}
{/if}

<a
  href="/produkty/{slug}"
  class="tile"
  class:new={isNew}
  class:sale
  class:bestseller
  class:coming_soon
  class:out_of_stock
  in:fly={{ y: -20, duration: 100 }}
>
  <AdminOnlyOverlay show={!enabled} />

  <div class="img-wrapper">
    {#if img}
      <img src={img.src} alt={img.alt} />
    {/if}
  </div>

  <div class="info">
    <div class="badges">
      <NewBadge show={isNew} />
      <BestsellerBadge show={bestseller} />
      <SaleBadge show={sale} />
      <ComingSoonBadge show={coming_soon} />
      <OutOfStockBadge show={out_of_stock} />
    </div>

    <div class="info__top">
      <div class="name">{name}</div>
      <div class="code">{code}</div>
    </div>
    <div class="info__bottom">
      {#if colors.length}
        <div class="colors">
          {#each colors as { multicolored, first, second, amount }, i}
            <Color
              {multicolored}
              {first}
              {second}
              {amount}
              notooltip
              onhoverchange={hover => handleHoverChange(hover, i)}
            />
          {/each}
        </div>
      {/if}
      <div class="price-wrapper">
        {#if price_min}
          <div class="price">
            <small class="price__from">od</small>
            <span class="price__value">
              <span class="price__value--normal" class:sale={price_min_sale}>
                {price_min.toFixed(2)}
              </span>
              {#if price_min_sale}
                <span class="price__value--sale">
                  {price_min_sale.toFixed(2)}
                </span>
              {/if}
            </span>
            <small class="price__currency" class:sale={price_min_sale}>zł</small>
          </div>
          {#if pricesWithLabeling}
            <div class="price-wrapper__with-labeling">Ze znakowaniem</div>
          {/if}
        {:else}
          <!-- unset or 0 -->
          <small class="price-wrapper__ask">Zapytaj o cenę</small>
        {/if}
      </div>
    </div>
  </div>
</a>

<style>
  .badges {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, 25%);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tile {
    --outline: 1px solid rgba(0, 0, 0, 0.05);
    position: relative;
    display: grid;
    grid-template-rows: auto 1fr;
    width: 100%;
    outline: var(--outline);
    background-color: var(--white);
    text-decoration: none;
    transition: transform 150ms;
  }
  .tile.coming_soon {
    --outline: 1px solid var(--coming-soon);
  }
  .tile.bestseller {
    --outline: 1px solid var(--bestseller);
  }
  .tile.sale {
    --outline: 1px solid var(--sale);
  }
  .tile.new {
    --outline: 1px solid var(--new);
  }
  .tile.out_of_stock {
    --outline: 1px solid var(--out-of-stock);
  }
  .tile:hover {
    z-index: 1; /* TODO: tootltip is broken, maybe tooltips should be defined in script on top the file they are used, and then in based on those definitions they should be rendered closed to the top of the DOM; it's because of this: https://mtsknn.fi/blog/breaking-css-position-fixed/
    /* outline: 1px solid var(--main); */
    transform: translateY(-0.5rem);
  }

  .img-wrapper {
    padding: 5%;
    width: 100%;
    aspect-ratio: 1 / 1;
  }
  .img-wrapper img {
    object-fit: contain;
    display: block;
    width: 100%;
    height: 100%;
    aspect-ratio: 1 / 1;
  }

  .info {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.7rem 0.9rem 1rem 0.9rem;
    border-top: var(--outline);
  }
  .info .badges {
    transform: translate(-50%, -50%);
  }

  .info__top {
    font-size: 1.05rem;
  }
  .name {
    font-weight: bold;
    line-height: 1.2;
  }
  .code {
    font-size: 0.9em;
    opacity: 0.6;
  }

  .info__bottom {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.35rem;
  }
  .colors {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .price-wrapper {
    display: flex;
    align-items: flex-end;
    font-size: 1.4rem;
  }
  .price__from {
    margin-right: 0.1em;
    font-size: 0.7em;
    opacity: 0.6;
  }
  .price__value {
    position: relative;
  }
  .price__value--normal.sale {
    position: absolute;
    bottom: -0.85rem;
    font-size: 0.75em;
    text-decoration: line-through;
    opacity: 0.5;
  }
  .price__value--sale,
  .price__currency.sale {
    font-weight: bold;
    color: var(--sale-dark);
  }
  .price-wrapper__with-labeling {
    position: relative;
    bottom: 0.2em;
    display: inline-block;
    margin-left: 0.5rem;
    border-radius: 1em;
    /* border: 1px solid rgba(100, 100, 100, 0.7); */
    padding: 0.2em 0.8em;
    background-color: rgba(100, 100, 100, 0.1);
    font-size: 0.5em;
    text-transform: uppercase;
    opacity: 0.6;
  }
</style>
