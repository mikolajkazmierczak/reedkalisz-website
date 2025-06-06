<script>
  import { marked } from 'marked';
  import { goto } from '$app/navigation';

  import { treeGetItem, treeGetItemsFromPath } from '%/utils';
  import AdminOnlyOverlay from '#c/AdminOnlyOverlay.svelte';
  import AdminBadge from '#c/badges/AdminBadge.svelte';
  import SaleBadge from '#c/badges/SaleBadge.svelte';
  import NewBadge from '#c/badges/NewBadge.svelte';
  import BestsellerBadge from '#c/badges/BestsellerBadge.svelte';
  import ComingSoonBadge from '#c/badges/ComingSoonBadge.svelte';
  import OutOfStockBadge from '#c/badges/OutOfStockBadge.svelte';
  import GoButton from '#c/GoButton.svelte';
  import Gallery from './Gallery.svelte';
  import Storage from './Storage.svelte';
  import Prices from './Prices.svelte';
  import Question from './Question.svelte';
  import Recommended from './Recommended.svelte';

  export let data;

  const { categoriesTree } = data;
  $: ({
    name,
    slug,
    code,
    company,
    enabled,
    new: isNew,
    bestseller,
    coming_soon,
    out_of_stock,
    categories,
    seo_title,
    seo_description,
    description,
    commercial_details,
    size_x,
    size_y,
    size_z,
    materials,
    sale,
    custom_prices_with_labeling,
    labeling_place,
    labeling_field_x,
    labeling_field_y,
    custom_prices,
    custom_prices_sale,
    labelings,
    storage,
    gallery
  } = data.product);

  $: mainGalleryImgs = getMainGalleryImgs(gallery, storage);
  $: showCustomPrices = custom_prices && custom_prices.some(p => p.enabled);
  $: showLabelingsPrices = labelings && labelings.some(l => l.prices.some(p => p.enabled));
  $: size = [size_x, size_y, size_z].filter(s => s).join(' x ') + 'mm';

  $: breadcrumbs = getBreadcrumbs(categories);
  $: lastBreadcrumb = breadcrumbs.length ? breadcrumbs[breadcrumbs.length - 1] : null;

  function handleBack() {
    try {
      history.back(); // this is a bad idea, doesn't work for many cases, for example for reccomened products
    } catch {
      // go to the products' deepest category or the default category
      goto(`/kategorie/${lastBreadcrumb?.slug ?? ''}`);
    }
  }

  function getMainGalleryImgs(gallery, storage) {
    if (!gallery || !storage) return [];
    const imgs = [];
    for (const img of gallery) {
      imgs.push(img);
    }
    for (const s of storage) {
      for (const img of s.img) {
        if (img.show_in_gallery) {
          imgs.push(img);
        }
      }
    }
    return imgs;
  }

  function findDeepestCategory(categories) {
    if (categories.length === 0) return null;
    let deepest = treeGetItem(categoriesTree, categories[0].category);
    for (const c of categories.slice(1)) {
      const category = treeGetItem(categoriesTree, c.category);
      if (category._meta.depth > deepest._meta.depth) deepest = category;
    }
    return deepest;
  }

  function getBreadcrumbs(categories) {
    if (!categories) return [];
    const category = findDeepestCategory(categories);
    if (!category) return [];
    const pathCategories = treeGetItemsFromPath(categoriesTree, category._meta.path);
    return pathCategories.map(({ name, slug }) => ({ name, slug }));
  }
</script>

<svelte:head>
  <title>{code} - {seo_title} | REED Kalisz</title>
  <meta name="description" content={seo_description} />
</svelte:head>

<div class="wrapper">
  <div class="top">
    <GoButton text="Wróć" arrowLeft onclick={handleBack} />
    {#if breadcrumbs.length > 0}
      <div class="breadcrumbs">
        {#each breadcrumbs as { name, slug }, i}
          <a href={`/kategorie/${slug}`} class="breadcrumb" class:last={i === breadcrumbs.length - 1}>
            {name}
          </a>
          {#if i !== breadcrumbs.length - 1}
            <span class="breadcrumbs__slash">/</span>
          {/if}
        {/each}
      </div>
    {/if}
  </div>

  <div class="column left">
    <Gallery imgs={mainGalleryImgs} />

    {#if storage.length}
      <div class="storages">
        {#each storage as s}
          <Storage {company} {code} storage={s} />
        {/each}
      </div>
    {/if}
  </div>

  <div class="column right">
    <h1 class="title">
      {name}
      <div class="badges">
        <AdminBadge show={!enabled} />
        <ComingSoonBadge show={coming_soon} />
        <BestsellerBadge show={bestseller} />
        <SaleBadge show={sale} />
        <NewBadge show={isNew} />
        <OutOfStockBadge show={out_of_stock} />
      </div>
    </h1>
    <h2 class="code">{code}</h2>

    {#if description}
      {@const post = commercial_details ? commercial_details.content : null}
      <div class="description">
        {@html marked.parse(description + (post ? '\n' + post : ''))}
      </div>
      {#if size_x || size_y || size_z}
        <p class="info size"><b>Rozmiar:</b> {size}</p>
      {/if}
      {#if materials.length}
        <p class="info material">
          <b>Materiał{materials.length > 1 ? 'y' : ''}:</b>
          {materials.join(', ')}
        </p>
      {/if}
    {/if}

    {#if showCustomPrices || showLabelingsPrices}
      <h2>Cennik</h2>
      <div class="pricings">
        {#if showCustomPrices}
          <div class="pricing">
            <Prices
              field={[labeling_field_x, labeling_field_y]}
              place={labeling_place}
              prices={custom_prices}
              pricesSale={custom_prices_sale}
              pricesWithLabeling={custom_prices_with_labeling}
            />
          </div>
        {/if}

        {#if showLabelingsPrices}
          {#each labelings as labeling}
            {@const { code, type, name } = labeling.labeling}
            <div class="pricing">
              <h3 class="pricing-title">
                <span class="pricing-name">{name}</span>
                <span class="pricing-info">
                  <span class="pricing-code">{code ?? ''}</span>
                  <span class="pricing-type">{type ?? ''}</span>
                </span>
              </h3>
              <Prices
                field={[labeling.labeling_field_x, labeling.labeling_field_y]}
                place={labeling.labeling_place}
                prices={labeling.prices}
                pricesSale={labeling.prices_sale}
                pricesWithLabeling
              />
              <AdminOnlyOverlay show={!labeling.enabled} />
            </div>
          {/each}
        {/if}
      </div>
    {/if}

    <div class="questions">
      <h2>Zapytaj</h2>
      <Question product={{ code, name, slug }} />
    </div>

    <Recommended categorySlug={lastBreadcrumb?.slug} />
  </div>
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-rows: auto auto;
    grid-template-columns: 3fr 7fr;
    row-gap: 2.5rem;
    column-gap: 6rem;
    padding: 5rem 0 3rem 0;
  }

  .top {
    display: flex;
    align-items: center;
    gap: 2rem;
    grid-column: 1 / -1;
  }
  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .breadcrumb {
    color: var(--main);
    text-decoration: none;
  }
  .breadcrumb.last {
    font-weight: bold;
  }
  .breadcrumb:hover {
    font-style: italic;
  }
  .breadcrumbs__slash {
    font-size: 1.5rem;
    color: rgba(0, 0, 0, 0.25);
  }

  /* .column.left */

  .storages {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding-top: 2rem;
  }

  /* .column.right */

  .column.right {
    position: relative;
  }

  h1 {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1rem;
    font-weight: 900;
    font-size: 2rem;
  }
  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
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
    max-width: 80ch;
  }
  :global(.description p) {
    margin: 0.5rem 0;
  }

  .size {
    margin-top: 1rem;
  }

  .pricings {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  .pricing {
    position: relative;
  }
  .pricing-title {
    display: flex;
    align-items: baseline;
    font-weight: normal;
  }
  .pricing-info {
    display: flex;
    gap: 0.4rem;
    margin-left: 0.5rem;
    font-size: 0.75em;
    opacity: 0.6;
  }
  .pricing-type {
    font-weight: bold;
  }

  .questions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
</style>
