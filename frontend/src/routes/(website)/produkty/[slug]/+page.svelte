<script>
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
            <img src="{baseUrl}/assets/{img}" alt="" on:click={() => (galleryImgIndex = i)} />
          {/if}
        {/each}
      </div>
    </div>
  </div>

  <div class="column right">
    <h1>{product.name}</h1>
  </div>
</div>

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
    width: 100%;
  }
  .gallery-picker {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  }
  .gallery-picker img {
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  h1 {
    font-weight: 900;
    font-size: 2rem;
  }
</style>
