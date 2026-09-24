<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Menu from '#/menu/Menu.svelte';

  export let items;
  /** Phone menu: categories open in place instead of by navigating. */
  export let expandable = false;

  let q = '';
  function search() {
    const query = q.trim();
    if (query) goto(`/kategorie/_?q=${encodeURIComponent(query)}`);
  }

  $: onContact = $page.url.pathname === '/kontakt';
</script>

<!-- Shared by the desktop rail and the phone menu (MenuOverlay lays it out differently). -->
<div class="rail__contact">
  <div class="brand-row">
    <a class="brand" href="/" aria-label="REED Kalisz — strona główna">
      <img src="/logo.svg" alt="REED" width="200" height="69" />
    </a>
    <a
      class="btn btn--orange kontakt"
      class:on={onContact}
      href="/kontakt"
      aria-current={onContact ? 'page' : undefined}>
      Kontakt
      {#if !onContact}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      {/if}
    </a>
    <slot name="aside" />
  </div>

  <div class="reach">
    <p class="reach__talk">
      <a href="tel:+48627531590">62&nbsp;753&nbsp;15&nbsp;90</a><span class="sep" aria-hidden="true">/</span><a
        href="mailto:info@reed.kalisz.pl">info@reed.kalisz.pl</a>
    </p>
    <p class="reach__visit">
      <a
        href="https://www.openstreetmap.org/?mlat=51.757428&amp;mlon=18.061910#map=17/51.757428/18.061910"
        target="_blank"
        rel="noreferrer">ul.&nbsp;Dobrzecka&nbsp;95<span class="visually-hidden"> (w nowej karcie)</span></a
      ><span class="sep" aria-hidden="true">/</span><span>pn–pt&nbsp;10:00–14:00</span>
    </p>
  </div>
</div>

<div class="rail__search">
  <form class="search-field search" role="search" action="/kategorie/_" on:submit|preventDefault={search}>
    <input
      bind:value={q}
      name="q"
      type="search"
      placeholder="Kod lub nazwa"
      aria-label="Szukaj po kodzie lub nazwie produktu" />
    <button type="submit" aria-label="Szukaj" class:ready={q.trim()}>
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="2" />
        <path d="m13.5 13.5 3.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </form>
</div>

<div class="rail__nav">
  <Menu {items} {expandable} />
</div>

<style>
  .brand img {
    width: auto;
    height: var(--logo-h);
  }

  .search input {
    flex: 1 1 auto;
    min-width: 0;
    height: 2.25rem;
    border: none;
    outline: none;
    background: none;
    font-size: var(--fs-xs);
  }
  .search input::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }
  .search button {
    flex: none;
    display: grid;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    margin-right: 0.25rem;
    border: none;
    border-radius: var(--r-pill);
    corner-shape: squircle;
    background-color: transparent;
    color: var(--ink-500);
    cursor: pointer;
    transition:
      background-color var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease);
  }
  .search button svg {
    width: 0.9375rem;
    height: 0.9375rem;
  }
  .search button:hover {
    color: var(--ink);
  }

  /* Rail: the brand row dissolves so the mark, contact lines and Kontakt stack. */
  .rail__contact {
    display: flex;
    flex-direction: column;
  }
  .brand-row {
    display: contents;
  }
  .brand {
    order: 1;
    align-self: flex-start;
    margin-bottom: var(--sp-4);
  }
  .reach {
    order: 2;
    color: #a9bcd6;
    font-size: var(--fs-xs);
    line-height: 1.45;
  }
  .reach a {
    white-space: nowrap;
    transition: color var(--dur-fast) var(--ease);
  }
  .reach a:hover {
    color: var(--orange-bright);
  }
  .reach__talk a {
    color: #fff;
    font-weight: 700;
  }
  .reach__visit {
    margin-top: 0.125rem;
  }
  .reach__visit a {
    color: inherit;
  }
  .reach__visit span {
    white-space: nowrap;
  }
  .sep {
    margin: 0 0.4em;
  }

  .kontakt {
    order: 3;
    justify-content: space-between;
    width: 100%;
    min-height: 2.5rem;
    margin-top: var(--sp-3);
    padding: 0 var(--sp-4);
  }
  .kontakt svg {
    width: 0.9375rem;
    height: 0.9375rem;
    transition: transform var(--dur) var(--ease);
  }
  .kontakt:hover svg {
    transform: translateX(3px);
  }
  /* On /kontakt: white, the current page rather than an action. */
  .kontakt.on {
    background-color: #fff;
    color: var(--navy);
  }
  /* 1rem avoids iOS zoom on focus; touch has no hover, so the glyph is full ink. */
  @media (max-width: 61.1875rem) {
    .search input {
      height: 2.75rem;
      font-size: 1rem;
    }
    .search button {
      width: 2.25rem;
      height: 2.25rem;
      color: var(--ink);
    }
    .search button svg {
      width: 1rem;
      height: 1rem;
    }
  }
  .search button.ready,
  .search button.ready:hover {
    background-color: var(--red);
    color: #fff;
  }
</style>
