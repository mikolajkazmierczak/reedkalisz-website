<script>
  import { fade } from 'svelte/transition';
  import { baseUrl } from '$/api';

  export let data;
  const { product } = data;
  console.log(product);
  const {
    id,
    name,
    code,
    slug,
    enabled,
    sale,
    seo_title,
    seo_description,
    description,
    categories,
    custom_prices_with_labeling,
    custom_prices,
    custom_prices_sale,
    labelings,
    storage,
    gallery
  } = product;

  let galleryImgIndex = gallery.length ? 0 : null;
</script>

<div class="wrapper">
  <div class="column left">
    <div class="gallery">
      <div class="gallery-img">
        <img src="{baseUrl}/assets/{gallery[galleryImgIndex].img}" alt="" />
      </div>
      <div class="gallery-picker">
        {#each gallery as { enabled, img }, i}
          {#if enabled}
            <img src="{baseUrl}/assets/{img}" alt="" on:mouseenter={() => (galleryImgIndex = i)} />
          {/if}
        {/each}
      </div>
    </div>
  </div>

  <div class="column right">
    <h1>{product.name}</h1>
  </div>
</div>

<!-- {#if isImgFullscreen}
  <div class="img-fullscreen" transition:fade={{ duration: 100 }}>
    <img
      src="{baseUrl}/assets/{gallery[galleryImgIndex].img}"
      alt=""
      style:top={fullscreenTop + 'px'}
      style:left={fullscreenLeft + 'px'}
    />
  </div>
{/if} -->
<style>
  .wrapper {
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: 2rem;
    margin-top: 3rem;
  }

  .gallery {
    width: 100%;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background-color: #fff;
  }
  .gallery img {
    display: block;
    width: 100%;
    object-fit: contain;
    aspect-ratio: 1 / 1;
  }
  .gallery-img {
    cursor: zoom-in;
    width: 100%;
  }
  .gallery-picker {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
  }
  .gallery-picker img {
    cursor: pointer;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  h1 {
    font-weight: 900;
    font-size: 2rem;
  }
</style>
