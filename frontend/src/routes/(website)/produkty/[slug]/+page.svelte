<script>
  import { onMount } from 'svelte';
  import { marked } from 'marked';

  import { treeGetItem, treeGetItemsFromPath } from '%/utils';
  import { me } from '$/auth';
  import { baseUrl } from '$/api';
  import { parseAmount, NONE } from '$/storage';
  import Color from '#c/Color.svelte';
  import SideRail from '#/shell/SideRail.svelte';
  import Badges from '#c/badges/Badges.svelte';
  import Gallery from './Gallery.svelte';
  import Storage from './Storage.svelte';
  import Prices from './Prices.svelte';
  import IncludesLabeling from './IncludesLabeling.svelte';
  import QuestionForm from '#c/QuestionForm.svelte';
  import Recommended from './Recommended.svelte';
  import { plural } from '#/utils';
  import { describe, jsonLd, breadcrumbList } from '#/seo';

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
    gallery,
  } = data.product);

  $: mainGalleryImgs = getMainGalleryImgs(gallery, storage);
  $: showCustomPrices = custom_prices && custom_prices.some((p) => p.enabled);
  $: showLabelingsPrices = labelings && labelings.some((l) => l.prices.some((p) => p.enabled));
  $: size = [size_x, size_y, size_z].filter((s) => s).join(' x ') + 'mm';

  $: enabledStorage = storage?.filter((s) => s.enabled) ?? [];
  $: summaryColors = enabledStorage.map(({ multicolored, color_first, color_second, amount, available }) => ({
    multicolored,
    first: color_first,
    second: color_second,
    amount,
    available,
  }));
  // Each price with whether it includes marking: labeling prices always do, custom ones when flagged.
  $: allPrices = [
    ...[...(custom_prices ?? []), ...(custom_prices_sale ?? [])].map((p) => [p, !!custom_prices_with_labeling]),
    ...(labelings ?? []).flatMap((l) => [...l.prices, ...l.prices_sale].map((p) => [p, true])),
  ]
    .filter(([p]) => p.enabled && p.price)
    .sort(([a], [b]) => a.price - b.price);
  $: priceFrom = allPrices[0]?.[0].price ?? null;
  $: priceFromWithLabeling = allPrices[0]?.[1] ?? false;
  $: inStock = enabledStorage.some((s) => parseAmount({ available: s.available, amount: s.amount }).state !== NONE);

  $: metaTitle = `${seo_title || name} — ${code}`;
  $: metaDescription = describe(seo_description || description);
  $: ogImage = mainGalleryImgs[0] ? `${baseUrl}/assets/${mainGalleryImgs[0].img}?key=medium` : null;

  $: breadcrumbs = getBreadcrumbs(categories);
  $: lastBreadcrumb = breadcrumbs.length ? breadcrumbs[breadcrumbs.length - 1] : null;

  function getMainGalleryImgs(gallery, storage) {
    if (!gallery || !storage) return [];
    // Skip gallery slots with no asset.
    const imgs = [];
    for (const img of gallery) {
      if (img?.img) imgs.push(img);
    }
    for (const s of storage) {
      // Admins also get disabled variants; keep their photos out.
      if (!s.enabled) continue;
      for (const img of s.img) {
        if (img.show_in_gallery && img.img) imgs.push(img);
      }
    }
    return imgs;
  }

  // Floating "Zapytaj": shown while the form is below the viewport.
  let askEl;
  let showFab = false;
  onMount(() => {
    const io = new IntersectionObserver(([e]) => {
      showFab = !(e.isIntersecting || e.boundingClientRect.top < 0);
    });
    io.observe(askEl);
    return () => io.disconnect();
  });
  function toAsk(e) {
    e.preventDefault();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    askEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    askEl.querySelector('.buy__ask-title')?.focus({ preventScroll: true });
  }

  // Only enabled categories are in the tree.
  function findDeepestCategory(categories) {
    let deepest = null;
    for (const c of categories) {
      const category = treeGetItem(categoriesTree, c.category);
      if (category && (!deepest || category._meta.depth > deepest._meta.depth)) deepest = category;
    }
    return deepest;
  }

  function getBreadcrumbs(categories) {
    const category = categories && findDeepestCategory(categories);
    if (!category) return [];
    const pathCategories = treeGetItemsFromPath(categoriesTree, category._meta.path);
    return pathCategories.map(({ name, slug }) => ({ name, slug }));
  }
</script>

<svelte:head>
  <title>{metaTitle} | REED Kalisz</title>
  {#if metaDescription}<meta name="description" content={metaDescription} />{/if}
  <meta property="og:title" content={metaTitle} />
  {#if ogImage}<meta property="og:image" content={ogImage} />{/if}
  {#if breadcrumbs.length}
    {@html jsonLd(
      breadcrumbList([
        ...breadcrumbs.map(({ name, slug }) => ({ name, path: `/kategorie/${slug}` })),
        { name, path: `/produkty/${slug}` },
      ]),
    )}
  {/if}
</svelte:head>

<div class="shell">
  <SideRail items={data.menus.side} />

  <div class="shell__main">
    <div class="wrap">
      {#if breadcrumbs.length}
        <nav class="crumbs label" aria-label="Ścieżka nawigacji">
          {#each breadcrumbs as { name, slug }, i}
            {#if i > 0}<span aria-hidden="true">/</span>{/if}
            <a href={`/kategorie/${slug}`}>{name}</a>
          {/each}
          <span aria-hidden="true">/</span>
          <span class="crumbs__here" aria-current="page">{code}</span>
        </nav>
      {/if}

      <div class="product">
        <!-- Own box, so the sticky buy panel can't slide over the variants. -->
        <div class="product__top">
          <div class="product__media">
            <Gallery imgs={mainGalleryImgs} alt={name} />

            {#if description}
              {@const post = commercial_details ? commercial_details.content : null}
              <section class="sec sec--desc">
                <h2 class="sec__title">Opis</h2>
                <div class="prose">
                  {@html marked.parse(description + (post ? '\n' + post : ''))}
                </div>
              </section>
            {/if}

            {#if showCustomPrices || showLabelingsPrices}
              <section class="sec sec--pricing">
                <h2 class="sec__title" id="cennik">Cennik</h2>
                <div class="pricings">
                  {#if showCustomPrices}
                    <div class="pricing">
                      <Prices
                        field={[labeling_field_x, labeling_field_y]}
                        place={labeling_place}
                        prices={custom_prices}
                        pricesSale={custom_prices_sale}
                        pricesWithLabeling={custom_prices_with_labeling} />
                    </div>
                  {/if}

                  {#if showLabelingsPrices}
                    {#each labelings.filter((l) => l.enabled) as labeling}
                      {@const { code, type, name, company } = labeling.labeling}
                      <div class="pricing">
                        <div class="pricing__head">
                          <h3 class="pricing__title">
                            <span>{name}</span>
                            <span class="pricing__meta">
                              {#if code}<span class="code">{code}</span>{/if}
                              {#if type}<span class="pricing__type">{type}</span>{/if}
                              {#if $me && company?.name}<span class="pricing__company">({company.name})</span>{/if}
                            </span>
                          </h3>
                          <IncludesLabeling />
                        </div>
                        <Prices
                          showIncludes={false}
                          field={[labeling.labeling_field_x, labeling.labeling_field_y]}
                          place={labeling.labeling_place}
                          prices={labeling.prices}
                          pricesSale={labeling.prices_sale}
                          pricesWithLabeling />
                      </div>
                    {/each}
                  {/if}
                </div>
              </section>
            {/if}
          </div>

          <div class="product__buy">
            <div class="buy">
              <div class="buy__summary">
                <Badges inline {isNew} {bestseller} {sale} {coming_soon} {out_of_stock} />
                {#if !enabled}
                  <p class="admin-note">Produkt ukryty — widoczny tylko dla zalogowanych.</p>
                {/if}

                <h1 class="buy__title">{name}</h1>
                <p class="code buy__code">{code}</p>

                {#if priceFrom}
                  <p class="buy__price">
                    <span class="buy__from">od</span>
                    <strong class="tnum">{priceFrom.toFixed(2)} zł</strong>
                    <span class="buy__unit">/ szt</span>
                    {#if priceFromWithLabeling}<span class="buy__with">ze znakowaniem</span>{/if}
                  </p>
                  {#if showCustomPrices || showLabelingsPrices}
                    <a class="buy__tocennik" href="#cennik">Pełny cennik według nakładu ↓</a>
                  {/if}
                {/if}

                {#if summaryColors.length}
                  <div class="buy__colors">
                    {#each summaryColors as { multicolored, first, second, amount, available }}
                      <Color {multicolored} {first} {second} {amount} {available} size="1.25rem" />
                    {/each}
                    <span class="buy__colors-n tnum">
                      {summaryColors.length}
                      {plural(summaryColors.length, ['kolor', 'kolory', 'kolorów'])}
                    </span>
                  </div>
                {/if}

                {#if size_x || size_y || size_z || materials?.length}
                  <dl class="specs">
                    {#if size_x || size_y || size_z}
                      <div>
                        <dt>Rozmiar</dt>
                        <dd class="tnum">{size}</dd>
                      </div>
                    {/if}
                    {#if materials?.length}
                      <div>
                        <dt>Materiał</dt>
                        <dd>{materials.join(', ')}</dd>
                      </div>
                    {/if}
                  </dl>
                {/if}
              </div>

              <div class="buy__ask" id="zapytaj" bind:this={askEl}>
                <h2 class="buy__ask-title" tabindex="-1">
                  <span class="buy__ask-word">Zapytanie</span> o <strong>{name}</strong>
                  <span class="code">{code}</span>
                </h2>
                <QuestionForm {code} />
              </div>
            </div>
          </div>
        </div>

        {#if enabledStorage.length}
          <section class="sec product__variants">
            <h2 class="sec__title">Kolory i dostępność</h2>
            <div class="storages">
              {#each enabledStorage as s}
                <Storage {company} {code} storage={s} />
              {/each}
            </div>
          </section>
        {/if}
      </div>
    </div>

    <a
      class="btn btn--orange fab"
      class:show={showFab}
      href="#zapytaj"
      tabindex={showFab ? 0 : -1}
      aria-hidden={!showFab}
      on:click={toAsk}>
      Zapytaj
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
        <path d="M12 5v14M6 13l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </a>

    <div class="wrap detail">
      <Recommended categorySlug={lastBreadcrumb?.slug} />
    </div>
  </div>
</div>

<style>
  /* Reserved so the title doesn't shift. */
  .crumbs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sp-2);
    min-height: 3rem;
    padding: var(--sp-4) 0 var(--sp-2);
  }
  .crumbs a {
    color: var(--ink-400);
  }
  .crumbs a:hover {
    color: var(--red);
  }
  .crumbs__here {
    color: var(--ink);
  }

  .product {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--sp-6);
    padding-bottom: var(--sp-10);
  }
  .product__media {
    display: flex;
    flex-direction: column;
    gap: var(--sp-12);
    min-width: 0;
  }

  /* --- the buy column ----------------------------------------------------- */

  .buy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-3);
  }
  .buy__summary {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-3);
    width: 100%;
  }
  /* Jump targets land clear of the phone's sticky bar. */
  .buy__ask,
  .sec__title {
    scroll-margin-top: calc(var(--topbar-h) + var(--sp-4));
  }
  .buy__ask-title:focus {
    outline: none;
  }

  /* --- floating "Zapytaj" (phone) ----------------------------------------- */
  .fab {
    position: fixed;
    right: var(--gutter);
    bottom: var(--sp-4);
    z-index: 50;
    gap: var(--sp-2);
    box-shadow: 0 0.5rem 1.5rem rgba(17, 17, 16, 0.28);
    opacity: 0;
    transform: translateY(0.75rem);
    pointer-events: none;
    transition:
      opacity var(--dur) var(--ease),
      transform var(--dur) var(--ease),
      background-color var(--dur) var(--ease),
      color var(--dur) var(--ease);
  }
  .fab.show {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }
  .fab svg {
    width: 1rem;
    height: 1rem;
  }
  @media (min-width: 56.25rem) {
    .fab {
      display: none;
    }
  }
  /* Framed like the rail's orange Kontakt button. */
  .buy__ask {
    width: 100%;
    margin-top: var(--sp-5);
    padding: var(--sp-5);
    border: 2px solid var(--orange);
    border-radius: var(--r-card);
    corner-shape: squircle;
    background-color: var(--surface);
  }
  .buy__ask-title {
    margin-bottom: var(--sp-4);
    color: var(--ink-500);
    font-size: var(--fs-sm);
    font-weight: 400;
  }
  .buy__ask-word {
    margin-right: 0.25rem;
    color: var(--orange);
    font-size: var(--fs-h3);
    font-weight: 700;
  }
  .buy__ask-title strong {
    color: var(--ink);
  }
  .buy__title {
    font-size: var(--fs-h1);
  }
  .buy__code {
    margin-top: calc(var(--sp-2) * -1);
  }

  /* Tight line box keeps the price and its link together. */
  .buy__price {
    display: flex;
    align-items: baseline;
    gap: var(--sp-2);
    margin-top: var(--sp-1);
    line-height: 1.1;
  }
  .buy__from {
    color: var(--ink-400);
    font-size: var(--fs-sm);
  }
  .buy__price strong {
    color: var(--red);
    font-size: clamp(1.875rem, 1.5rem + 1.4vw, 2.5rem);
    font-weight: 800;
    letter-spacing: -0.035em;
  }
  .buy__tocennik {
    margin-top: calc(var(--sp-2) * -1);
    color: var(--ink-500);
    font-size: var(--fs-xs);
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  .buy__tocennik:hover {
    color: var(--red);
  }
  .buy__unit {
    color: var(--ink-400);
    font-size: var(--fs-sm);
  }
  .buy__with {
    color: var(--red);
    font-size: var(--fs-sm);
    font-weight: 700;
  }

  .buy__colors {
    margin-top: var(--sp-2);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
    width: 100%;
  }
  .buy__colors-n {
    color: var(--ink-400);
    font-size: var(--fs-xs);
  }
  .buy__colors-n {
    margin-left: var(--sp-2);
  }

  .specs {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: var(--sp-2) 0 0;
    border-top: 1px solid var(--border);
  }
  .specs > div {
    display: flex;
    gap: var(--sp-4);
    padding: var(--sp-2) 0;
    border-bottom: 1px solid var(--border);
    font-size: var(--fs-sm);
  }
  .specs dt {
    flex: none;
    width: 7rem;
    color: var(--ink-400);
  }
  .specs dd {
    margin: 0;
    font-weight: 600;
  }

  .admin-note {
    padding: var(--sp-2) var(--sp-3);
    background-color: var(--red-tint);
    color: var(--red-deep);
    font-size: var(--fs-xs);
    font-weight: 700;
  }

  /* --- detail ------------------------------------------------------------- */

  .detail {
    display: flex;
    flex-direction: column;
    gap: var(--sp-12);
    padding-bottom: var(--sp-16);
  }
  .sec__title {
    margin-bottom: var(--sp-4);
    padding-bottom: var(--sp-2);
    border-bottom: var(--rule);
    font-size: var(--fs-h2);
  }

  .storages {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 9.375rem), 1fr));
    gap: var(--sp-3);
  }

  .pricings {
    display: flex;
    flex-direction: column;
    gap: var(--sp-8);
  }
  .pricing {
    position: relative;
    min-width: 0;
  }
  .pricing__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-2) var(--sp-4);
    margin-bottom: var(--sp-3);
  }
  .pricing__title {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--sp-2);
    font-size: var(--fs-h3);
  }
  .pricing__meta {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--sp-2);
    font-size: var(--fs-xs);
    font-weight: 400;
  }
  .pricing__type {
    color: var(--ink-400);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .pricing__company {
    color: var(--red);
    font-weight: 700;
  }

  @media (min-width: 56.25rem) {
    .product {
      display: block;
      padding-bottom: var(--sp-12);
    }
    .product__top {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: var(--sp-8);
      align-items: start;
    }
    /* Sticky within .product__top. */
    .product__buy {
      position: sticky;
      top: var(--sp-5);
    }
    .product__variants {
      margin-top: var(--sp-12);
    }
    .storages {
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 10.3125rem), 1fr));
      gap: var(--sp-3);
    }
  }

  /* --- phone: one column — gallery, summary, description, prices, variants, enquiry --- */
  @media (max-width: 56.2488rem) {
    .product {
      display: flex;
      flex-direction: column;
      gap: var(--sp-10);
    }
    .product__top,
    .product__media,
    .product__buy,
    .buy {
      display: contents;
    }
    .product__media > :global(.gallery) {
      order: 1;
    }
    .buy__summary {
      order: 2;
      margin-top: calc(var(--sp-5) - var(--sp-10));
    }
    .sec--desc {
      order: 3;
    }
    .sec--pricing {
      order: 4;
    }
    .product__variants {
      order: 5;
    }
    /* Single column: the enquiry is a plain titled section, no frame. */
    .buy__ask {
      order: 6;
      margin-top: 0;
      padding: 0;
      border: none;
      border-radius: 0;
      background: none;
    }
    .buy__ask-title {
      margin-bottom: var(--sp-4);
      padding-bottom: var(--sp-2);
      border-bottom: var(--rule);
    }
    .buy__ask-word {
      font-size: var(--fs-h2);
    }
  }
</style>
