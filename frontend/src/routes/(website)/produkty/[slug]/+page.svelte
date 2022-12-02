<script>
  import { marked } from 'marked';

  import AdminBadge from '#c/AdminBadge.svelte';
  import SaleBadge from '#c/SaleBadge.svelte';
  import NewBadge from '#c/NewBadge.svelte';
  import Gallery from './Gallery.svelte';
  import Storage from './Storage.svelte';
  import Pricing from './Pricing.svelte';
  import Question from './Question.svelte';

  export let data;
  const { product } = data;
  const {
    id,
    name,
    code,
    slug,
    enabled,
    new: isNew,
    sale,
    seo_title,
    seo_description,
    description,
    categories,
    custom_prices_with_labeling,
    labeling_field_x,
    labeling_field_y,
    custom_prices,
    custom_prices_sale,
    labelings,
    storage,
    gallery
  } = product;

  function getMainGalleryImgs(gallery, storage) {
    const imgs = [];
    for (const img of gallery) {
      imgs.push(img);
    }
    for (const s of storage) {
      for (const img of s.img) {
        imgs.push(img);
      }
    }
    return imgs;
  }

  const mainGallery = getMainGalleryImgs(gallery, storage);
  const showCustomPrices = custom_prices.some(p => p.enabled);
  const showLabelingsPrices = labelings.some(l => l.prices.some(p => p.enabled));
  console.log(labelings);
</script>

<svelte:head>
  <title>{seo_title} - {code} | REED Kalisz</title>
  <meta name="description" content={seo_description} />
</svelte:head>

<div class="wrapper">
  <div class="column left">
    <div class="gallery">
      <Gallery imgs={mainGallery} />
    </div>

    {#if storage.length}
      <h2>Kolory</h2>
      <div class="storages">
        {#each storage as s}
          <Storage {code} storage={s} />
        {/each}
      </div>
    {/if}
  </div>

  <div class="column right">
    <div class="badges">
      <AdminBadge {enabled} />
      <NewBadge {isNew} />
      <SaleBadge {sale} />
    </div>

    <h1 class="title">{name}</h1>
    <h2 class="code">{code}</h2>
    {#if description}
      <div class="description">{@html marked.parse(description)}</div>
    {/if}

    {#if showCustomPrices || showLabelingsPrices}
      <h2>Cennik</h2>
      <div class="prices-wrapper">
        {#if showCustomPrices}
          {#if labeling_field_x && labeling_field_x}
            <small class="labeling-field">
              Pole znakowania {labeling_field_x}x{labeling_field_y} mm
            </small>
          {/if}
          <div class="prices">
            <Pricing
              prices={custom_prices.filter(p => p.enabled)}
              pricesSale={custom_prices_sale.filter(p => p.enabled)}
            />
            {#if custom_prices_with_labeling}
              <div class="prices-with-labeling">Ceny ze znakowaniem</div>
            {/if}
          </div>
        {/if}

        {#if showLabelingsPrices}
          {#each labelings.filter(l => l.enabled) as labeling}
            {@const { company, code, type, name } = labeling.labeling}
            <h3>{name} <span>{company.name} {code ?? ''} {type ?? ''}</span></h3>
            {#if labeling.labeling_field_x && labeling.labeling_field_x}
              <small class="labeling-field">
                Pole znakowania {labeling.labeling_field_x}x{labeling.labeling_field_y} mm
              </small>
            {/if}
            <div class="prices">
              <Pricing
                prices={labeling.prices.filter(p => p.enabled)}
                pricesSale={labeling.prices_sale.filter(p => p.enabled)}
              />
              <div class="prices-with-labeling">Ceny ze znakowaniem</div>
            </div>
          {/each}
        {/if}
      </div>
    {/if}

    <div class="questions">
      <h2>Zapytaj / Zamów</h2>
      <Question product={{ code, name, slug }} />
    </div>
  </div>
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: 4rem;
    margin-top: 3rem;
  }

  /* .column.left */

  .storages {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  /* .column.right */

  .column.right {
    position: relative;
  }
  .badges {
    position: absolute;
    top: -1rem;
    left: 0;
    transform: translateY(-100%);
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  h1 {
    position: relative;
    font-weight: 900;
    font-size: 2rem;
  }
  h2 {
    margin-top: 3rem;
    margin-bottom: 1rem;
    font-weight: normal;
  }
  .code {
    margin-top: 0.5rem;
  }
  .description {
    margin-top: 2rem;
  }
  :global(.description p) {
    margin: 0.5rem 0;
  }

  .prices-with-labeling {
    display: inline-block;
    opacity: 0.6;
    border-top: none;
    padding: 0.25rem 0.5rem;
    background-color: var(--grey);
    font-size: small;
    text-transform: uppercase;
  }
  .prices-wrapper h3 {
    margin-top: 1.5rem;
    font-weight: normal;
  }
  .prices-wrapper h3 span {
    font-size: 0.75em;
    opacity: 0.6;
  }
  .prices {
    margin-top: 0.5rem;
  }
  .labeling-field {
    display: block;
    opacity: 0.6;
  }

  .questions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
</style>
