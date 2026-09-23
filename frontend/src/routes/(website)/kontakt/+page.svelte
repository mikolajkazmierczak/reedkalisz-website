<script>
  import { marked } from 'marked';
  import SideRail from '#/shell/SideRail.svelte';
  import QuestionForm from '#c/QuestionForm.svelte';
  import { jsonLd, business } from '#/seo';

  export let data;
</script>

<svelte:head>
  <title>Kontakt | REED Kalisz</title>
  <meta
    name="description"
    content="REED Kalisz — druk, grawerowanie laserowe, pieczątki i gadżety reklamowe. ul. Dobrzecka 95, 62-800 Kalisz." />
  {@html jsonLd(business)}
</svelte:head>

<div class="shell">
  <SideRail items={data.menus.side} />

  <div class="shell__main">
    <section class="band">
      <div class="wrap">
        <h1 class="band__title">Kontakt</h1>
        <p class="band__lede">Biuro w Kaliszu, pn–pt 10:00–14:00. Napisz albo zadzwoń — odpiszemy z ceną i terminem.</p>
      </div>
    </section>

    <div class="wrap body">
      <div class="prose info">
        {@html marked.parse(data.fragment.content)}
      </div>

      <div class="ask" id="zapytanie">
        <h2 class="ask__title">Czego potrzeba?</h2>
        <p class="ask__lede">Nakład, termin i budżet wystarczą, żebyśmy odpisali z konkretną wyceną.</p>
        <QuestionForm source="contact" />
      </div>

      <div class="map">
        <iframe
          title="REED Kalisz na mapie OpenStreetMap"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          src="https://www.openstreetmap.org/export/embed.html?bbox=18.06013941764832%2C51.75668907327362%2C18.063679933547977%2C51.75816671026607&amp;layer=mapnik&amp;marker=51.75742789781386%2C18.061909675598145"
        ></iframe>
        <a
          class="map__link"
          href="https://www.openstreetmap.org/?mlat=51.757428&amp;mlon=18.061910#map=19/51.757428/18.061910"
          target="_blank"
          rel="noreferrer">Otwórz większą mapę<span class="visually-hidden"> (w nowej karcie)</span></a>
      </div>
    </div>
  </div>
</div>

<style>
  .band {
    padding: var(--sp-10) 0;
    border-bottom: var(--rule);
    background-color: var(--navy);
    color: #fff;
  }
  .band__title {
    font-size: var(--fs-h1);
  }
  .band__lede {
    margin-top: var(--sp-3);
    max-width: 52ch;
    color: #a9bcd6;
  }

  .body {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--sp-8);
    padding-top: var(--sp-8);
    padding-bottom: var(--sp-16);
  }
  .ask {
    grid-column: 1 / -1;
    order: 3;
    padding-top: var(--sp-8);
    border-top: var(--rule);
  }
  .ask__title {
    font-size: var(--fs-h2);
  }
  .ask__lede {
    margin: var(--sp-2) 0 var(--sp-5);
    max-width: 56ch;
    color: var(--ink-500);
    font-size: var(--fs-sm);
  }
  .ask :global(.qf) {
    max-width: 46rem;
  }
  .info {
    max-width: 48ch;
  }
  .info :global(h2) {
    font-size: var(--fs-h3);
  }

  .map {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-2);
    min-width: 0;
  }
  .map iframe {
    width: 100%;
    aspect-ratio: 4 / 3;
    border: var(--rule);
    background-color: var(--paper-2);
  }
  .map__link {
    color: var(--ink-500);
    font-size: var(--fs-xs);
  }

  @media (min-width: 56.25rem) {
    .body {
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      gap: var(--sp-10);
      align-items: start;
    }
    .map iframe {
      aspect-ratio: 16 / 10;
    }
  }
</style>
