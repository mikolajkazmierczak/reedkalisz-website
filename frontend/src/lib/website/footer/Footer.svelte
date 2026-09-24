<script>
  import { marked } from 'marked';
  import { page } from '$app/stores';

  export let fragments;

  const { about, office, rights } = fragments;

  // /kontakt already shows these fragments; keep only the rights line there.
  $: isContact = $page.url.pathname === '/kontakt';
</script>

<footer class="foot island">
  {#if !isContact}
    <div class="foot__main">
      <div class="wrap cols">
        <div class="col">
          <img class="mark" src="/logo.svg" alt="REED" width="139" height="48" />
          <div class="prose tight">{@html marked.parse(about.content)}</div>
        </div>

        <div class="col">
          <div class="prose tight">{@html marked.parse(office.content)}</div>
          <a
            class="btn btn--ghost-light social"
            href="https://www.facebook.com/reed.reklama.kalisz"
            target="_blank"
            rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
            </svg>
            Facebook<span class="visually-hidden"> (w nowej karcie)</span>
          </a>
        </div>

        <div class="col col--map">
          <iframe
            class="map"
            title="REED Kalisz, ul. Dobrzecka 95, na mapie OpenStreetMap"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            src="https://www.openstreetmap.org/export/embed.html?bbox=18.05306%2C51.75300%2C18.07076%2C51.76186&amp;layer=mapnik&amp;marker=51.757428%2C18.061910"
          ></iframe>
          <a
            class="map__link"
            href="https://www.openstreetmap.org/?mlat=51.757428&amp;mlon=18.061910#map=17/51.757428/18.061910"
            target="_blank"
            rel="noreferrer"
            >Dobrzecka 95, Kalisz — otwórz mapę<span class="visually-hidden"> (w nowej karcie)</span></a>
        </div>
      </div>
    </div>
  {/if}

  <div class="foot__rights">
    <div class="wrap">
      {@html marked.parse(rights.content)}
    </div>
  </div>
</footer>

<style>
  .foot {
    background-color: var(--ink);
  }

  .foot__main {
    padding: var(--sp-12) 0 var(--sp-10);
    background-color: var(--ink);
    color: #fff;
  }

  .cols {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--sp-8);
  }

  .mark {
    width: auto;
    height: 3.625rem;
    margin-bottom: var(--sp-4);
  }

  .social {
    margin-top: var(--sp-5);
  }
  .social svg {
    width: 1.125rem;
    height: 1.125rem;
  }

  .tight {
    max-width: 46ch;
    color: #a8a49c;
    font-size: var(--fs-sm);
    line-height: 1.6;
  }
  .tight :global(h2) {
    margin-bottom: var(--sp-3);
    color: #fff;
    font-size: var(--fs-h3);
  }
  .tight :global(p + p) {
    margin-top: var(--sp-3);
  }
  /* Stacked: the grid gap is enough, drop the heading's top margin. */
  @media (max-width: 47.4988rem) {
    .tight > :global(:first-child) {
      margin-top: 0;
    }
  }
  .tight :global(a) {
    color: #fff;
    text-decoration: underline;
    text-underline-offset: 0.18em;
  }
  .tight :global(a:hover) {
    color: var(--orange-bright);
  }

  .foot__rights {
    padding: var(--sp-4) 0;
    background-color: var(--ink);
    border-top: 1px solid #2e2d2b;
    color: #78746d;
    font-size: var(--fs-xs);
  }
  .foot__rights :global(p) {
    margin: 0;
  }
  .foot__rights :global(a) {
    color: #a8a49c;
  }
  .foot__rights :global(a:hover) {
    color: #fff;
  }

  .col--map {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-2);
    min-width: 0;
  }
  .map {
    width: 100%;
    aspect-ratio: 1.57 / 1;
    border: 1px solid #3a3835;
    background-color: var(--paper-2);
  }
  .map__link {
    color: #a8a49c;
    font-size: var(--fs-xs);
    text-decoration: underline;
    text-underline-offset: 0.18em;
  }
  .map__link:hover {
    color: #fff;
  }

  @media (min-width: 47.5rem) {
    .cols {
      grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
      gap: var(--sp-8) var(--sp-10);
    }
    .col--map {
      grid-column: 1 / -1;
      max-width: 25.5rem;
    }
    .map {
      aspect-ratio: 2.09 / 1;
    }
  }

  @media (min-width: 67.5rem) {
    .cols {
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1.1fr);
    }
    .col--map {
      grid-column: auto;
      max-width: none;
    }
    .map {
      width: 85%;
      aspect-ratio: 1.57 / 1;
    }
  }
</style>
