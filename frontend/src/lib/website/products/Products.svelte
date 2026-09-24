<script>
  import ProductTile from './ProductTile.svelte';

  export let products;
</script>

{#if products.length}
  <!-- Unkeyed: paging reuses the cards, so each one crossfades its picture instead of being rebuilt. -->
  <div class="grid">
    {#each products as product}
      {#if product.url}
        <a class="promo" href={product.url} target="_blank" rel="noreferrer">
          <div class="promo__media">
            <img src={product.img} alt={product.alt} loading="lazy" decoding="async" />
          </div>
          <div class="promo__body">
            <h3 class="promo__title">{product.title}</h3>
            <p class="promo__sub">{product.subtitle}</p>
          </div>
        </a>
      {:else}
        <ProductTile {product} />
      {/if}
    {/each}
  </div>
{:else}
  <div class="empty">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" stroke-linecap="round" />
    </svg>
    <h2>Brak produktów</h2>
    <p>
      W tej kategorii nie ma jeszcze produktów. Sprawdź inną kategorię lub napisz do nas — wiele rzeczy sprowadzamy na
      zamówienie.
    </p>
    <a class="btn btn--orange empty__cta" href="/kontakt">Napisz do nas</a>
  </div>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--sp-3);
  }
  @media (min-width: 35rem) {
    .grid {
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 13.125rem), 1fr));
      gap: var(--sp-4);
    }
  }
  @media (min-width: 56.25rem) {
    .grid {
      /* 12.5rem floor: four columns beside the rail. */
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 12.5rem), 1fr));
      gap: var(--sp-5);
    }
  }

  /* === Promotional tile (externally linked) === */

  .promo {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    background-color: var(--paper-2);
    color: inherit;
    text-decoration: none;
    overflow: hidden;
    transition:
      border-color var(--dur) var(--ease),
      box-shadow var(--dur) var(--ease);
  }
  .promo:hover {
    border-color: var(--border-strong);
  }
  .promo__media {
    aspect-ratio: 1 / 1;
    padding: var(--sp-4);
  }
  .promo__media img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .promo__body {
    padding: var(--sp-4);
    border-top: 1px solid var(--border);
  }
  .promo__title {
    font-size: 0.9375rem;
    font-weight: 600;
  }
  .promo__sub {
    margin-top: var(--sp-1);
    color: var(--text-muted);
    font-size: var(--fs-sm);
  }

  /* === Empty state === */

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sp-3);
    padding: var(--sp-16) var(--sp-4);
    border: 1px dashed var(--border-strong);
    border-radius: var(--r-sm);
    text-align: center;
  }
  .empty svg {
    width: 2.125rem;
    height: 2.125rem;
    color: var(--ink-400);
  }
  .empty h2 {
    font-size: var(--fs-h3);
  }
  .empty p {
    max-width: 46ch;
    color: var(--text-muted);
    font-size: var(--fs-sm);
  }
  .empty__cta {
    margin-top: var(--sp-2);
  }
</style>
