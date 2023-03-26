<script>
  import { fly } from 'svelte/transition';

  import { baseUrl } from '$/api';
  import Color from '#c/Color.svelte';
  import AdminBadge from '#c/badges/AdminBadge.svelte';
  import SaleBadge from '#c/badges/SaleBadge.svelte';
  import NewBadge from '#c/badges/NewBadge.svelte';

  export let product;
  $: ({
    id,
    name,
    code,
    slug,
    enabled,
    new: isNew,
    sale,
    custom_prices_with_labeling,
    custom_prices,
    custom_prices_sale,
    labelings,
    storage,
    gallery
  } = product);

  function getLowestPrice(prices) {
    const filtered = prices
      .filter(p => p.enabled)
      .map(p => p.price)
      .filter(Boolean);
    return filtered.length ? Math.min(...filtered) : null;
  }

  function getLowestPriceFromPair(prices, pricesSale) {
    const price = getLowestPrice(prices);
    const priceSale = getLowestPrice(pricesSale);
    if (price == null && priceSale == null) {
      return null;
    } else return price == null ? priceSale : price;
  }

  function getBestPrice(custom_prices, custom_prices_sale, labelings) {
    const customPrice = {
      type: 'custom',
      value: getLowestPriceFromPair(custom_prices, custom_prices_sale)
    };

    const labelingsPrice = { type: 'labeling', value: null };
    for (const labeling of labelings) {
      const price = getLowestPriceFromPair(labeling.prices, labeling.prices_sale);
      if (labelingsPrice.value == null || price < labelingsPrice.value) {
        labelingsPrice.value = price;
      }
    }

    if (customPrice.value == null && labelingsPrice.value == null) {
      return { type: 'none', value: null };
    } else return customPrice.value == null ? labelingsPrice : customPrice;
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

  $: colors = storage.map(({ color_first, color_second, multicolored, amount, enabled }) => {
    return { first: color_first, second: color_second, multicolored, amount, enabled };
  });

  $: price = getBestPrice(custom_prices, custom_prices_sale, labelings);
</script>

<a class="tile" href="/produkty/{slug}" in:fly={{ y: -20, duration: 100 }}>
  <div class="badges">
    <AdminBadge {enabled} />
    <NewBadge {isNew} />
  </div>

  <div class="img-wrapper">
    {#if img}<img src={img.src} alt="" />{/if}
  </div>

  <div class="info">
    <div class="badges">
      <SaleBadge {sale} />
    </div>
    <div class="text">
      <div class="name">{name}</div>
      <div class="code">{code}</div>
    </div>
    <div class="price">
      {#if price.value}
        <span><small class="from">od</small>{price.value.toFixed(2)}<small class="currency">zł</small></span>
      {:else}
        <small class="empty">Zapytaj o cenę</small>
      {/if}
      {#if price.value != null && (price.type == 'labeling' || custom_prices_with_labeling)}
        <div class="with-labeling">Ze znakowaniem</div>
      {/if}
    </div>
    <div class="colors">
      {#each colors as { amount, first, second, multicolored }}
        <Color {amount} {first} {second} {multicolored} />
      {/each}
    </div>
  </div>
</a>

<style>
  .tile {
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0, 0, 0, 0.1);
    /* padding: 0.5rem; */
    text-decoration: none;
    background-color: rgb(250, 250, 250);
  }
  .tile:hover {
    /* border: 1px solid var(--main-1); */
    background-color: var(--main-0);
  }

  .badges {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, 25%);
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 0.5rem;
  }

  .img-wrapper {
    padding: 5%;
    width: 100%;
    aspect-ratio: 1 / 1;
    background-color: #fff;
  }
  .img-wrapper img {
    object-fit: contain;
    display: block;
    border-radius: 10px 10px 0 0;
    width: 100%;
    height: 100%;
    aspect-ratio: 1 / 1;
  }

  .info {
    position: relative;
    padding: 0.8rem;
    padding-top: 1rem;
    padding-bottom: 1.2rem;
  }
  .info .badges {
    transform: translate(-50%, -50%);
  }
  .name {
    font-size: 1.1rem;
    font-weight: bold;
  }
  .tile:hover .name {
    text-decoration: underline;
  }

  .price {
    display: flex;
    align-items: center;
    font-size: 1.25rem;
    margin: 0.75rem 0;
  }
  .from {
    margin-right: 0.35rem;
    font-size: 0.7em;
    opacity: 0.5;
  }
  .currency {
    margin-left: 0.15rem;
  }
  .with-labeling {
    display: inline-block;
    margin-left: 0.5rem;
    border-radius: 10px;
    border: 1px solid rgba(100, 100, 100, 0.2);
    padding: 2px 7px;
    background-color: rgb(255, 255, 255);
    font-size: 0.8rem;
    /* opacity: 0.9; */
    /* background-color: var(--main-1); */
    /* background-color: rgb(234, 245, 255); */
  }

  .colors {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 5px;
  }
</style>
