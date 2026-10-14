<script>
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { deep, treeFlatten } from '%/utils';
  import SideRail from '#/shell/SideRail.svelte';

  import { modified, editing, selected } from '#/layout/store';
  import { parseLayout, parseBack, save, FIXED } from '#/layout/utils';
  import Element from '#/layout/Element.svelte';
  import Title from '#/layout/elements/Title.svelte';
  import Tiles from '#/layout/elements/tiles/Tiles.svelte';
  import Category from '#/layout/elements/Category.svelte';
  import Catalogue from '#/layout/elements/Catalogue.svelte';
  import Headquarters from '#/layout/elements/Headquarters.svelte';
  import HeroMachine from '#c/HeroMachine.svelte';
  import { heroFit } from '#c/heroFit';
  import { SITE, jsonLd, business, tel } from '#/seo';

  const types = [
    { type: 'title', label: 'Tytuł', icon: 'text_t' },
    { type: 'tiles', label: 'Kafelki', icon: 'apps' },
    { type: 'category', label: 'Kategoria', icon: 'categories' },
  ];
  const labels = [
    ...types,
    { type: 'catalogue', label: 'Katalog', icon: 'grid' },
    { type: 'headquarters', label: 'Siedziba', icon: 'location' },
  ];

  export let data;

  let loadedLayout = null;
  let originalLayout = [];
  let parsedLayout = [];

  $: refresh(data); // DO NOT just assign `data.layout` to `parsedLayout` because all hell breaks loose
  $: current = parseBack(deep.copy(parsedLayout));
  $: $modified = !deep.same(originalLayout, current);

  $: ({ categoriesTree } = $page.data);

  $: ({ summary } = data);
  $: catalogueCount = Math.floor((summary?.total ?? 0) / 100) * 100;

  /* Resolves category names to links (missing ones become plain text). Promo sections are searched last; exact names beat case-insensitive. */
  function categoryIndex(sections) {
    const exact = new Map();
    const loose = new Map();
    const promo = /promocje|bestseller|nowości/i;
    const ordered = [...sections.filter((s) => !promo.test(s.name)), ...sections.filter((s) => promo.test(s.name))];
    const add = (name, href) => {
      const n = name.trim();
      if (!exact.has(n)) exact.set(n, href);
      if (!loose.has(n.toLowerCase())) loose.set(n.toLowerCase(), href);
    };
    const walk = (node, href) => {
      add(node.name, href);
      for (const c of node.children ?? []) walk(c, `/kategorie/${c.slug}`);
    };
    for (const s of ordered) walk(s, s.href);
    return (name) => exact.get(name) ?? loose.get(name.toLowerCase()) ?? null;
  }
  $: to = categoryIndex(summary?.sections ?? []);
  $: categories = treeFlatten(categoriesTree).map(({ slug, name, _meta }) => {
    const path = _meta.path.map((p) => p + 1).join('.');
    return { id: slug, text: `${path} ${name}` };
  });

  function refresh(data) {
    if (deep.same(loadedLayout, data.layout)) return;
    loadedLayout = deep.copy(data.layout);
    parsedLayout = parseLayout(deep.copy(loadedLayout));
    // Compare against the layout as saved, so blocks parseLayout drops don't count as edits.
    originalLayout = parseBack(deep.copy(parsedLayout));
  }

  // the editor (an admin's, see Admin): saved, the page reloads its layout; dropped, it's parsed again from it
  async function saveLayout() {
    try {
      await save(current);
    } catch (e) {
      // the website has no error panel: a silent failure looked saved
      alert(`Nie udało się zapisać układu. Spróbuj ponownie.\n${e.message}`);
      return;
    }
    $modified = false;
    closeEditor();
  }
  function discardLayout() {
    if ($modified) parsedLayout = parseLayout(deep.copy(loadedLayout));
    closeEditor();
  }
  function closeEditor() {
    $selected = null;
    $editing = false;
  }

  // leaving with the editor open: with changes it asks first (see the Editor), without them it just closes
  beforeNavigate(() => {
    if ($editing && !$modified) closeEditor();
  });
</script>

<svelte:head>
  <title>REED Kalisz: gadżety reklamowe, druk, grawer laserowy</title>
  <meta
    name="description"
    content="Gadżety reklamowe z logo, druk cyfrowy, grawerowanie laserowe i pieczątki. Znakowanie robimy u siebie w Kaliszu od 2002 roku." />
  <meta property="og:title" content="REED Kalisz: gadżety reklamowe, druk, grawer laserowy" />
  <meta property="og:image" content="{SITE}/imgs/machine-playful.webp" />
  {@html jsonLd(business)}
</svelte:head>

<div class="shell">
  <SideRail items={data.menus.side} />

  <div class="shell__main" id="tresc">
    <section class="hero">
      <div class="hero__inner" use:heroFit>
        <div class="hero__copy">
          <h1 class="hero__title two-tone">
            Na biurko, na&nbsp;ścianę,<br /> do&nbsp;kieszeni.<br class="hero__br" />
            <em>Porządnie,<br /> z&nbsp;Twoim logo.</em>
          </h1>
          <div class="hero__body">
            <p class="hero__lede">
              Doradzimy przy wyborze i oznakujemy: grawerem laserowym, tampodrukiem albo drukiem cyfrowym. Robimy też
              pieczątki i druki samokopiujące.
              <span class="hero__own">Na własnych maszynach, w&nbsp;Kaliszu, od 2002 roku.</span>
            </p>
            <div class="hero__acts hang">
              <a class="btn btn--light" href="/kategorie/_">
                {catalogueCount ? `Katalog ${catalogueCount}+ produktów` : 'Przejdź do katalogu'}
              </a>
              <a class="btn btn--ghost-orange" href="/kontakt">Napisz do nas</a>
            </div>
          </div>
        </div>
        <div class="hero__plate" aria-hidden="true">
          <span class="hero__machine"><HeroMachine /></span>
        </div>
      </div>
    </section>

    <div class="blocks">
      {#each parsedLayout as element (element._id)}
        {@const { type } = element}
        <Element bind:element types={labels} fixed={FIXED.includes(type)} bleed={type === 'headquarters'}>
          {#if type === 'title'}
            <Title {element} />
          {:else if type === 'category'}
            <Category {element} />
          {:else if type === 'tiles'}
            <Tiles bind:element />
          {:else if type === 'catalogue'}
            <Catalogue {summary} />
          {:else if type === 'headquarters'}
            <Headquarters />
          {/if}
        </Element>
      {/each}
    </div>

    {#if $editing}
      {#await import('#/layout/editor/Editor.svelte') then { default: Editor }}
        <svelte:component
          this={Editor}
          bind:layout={parsedLayout}
          types={labels}
          addable={types.map((t) => t.type)}
          {categories}
          save={saveLayout}
          discard={discardLayout} />
      {/await}
    {/if}

    <!-- SEO copy. Confirmed claims only: no turnaround, minimums or client names. -->
    <section class="seo" aria-labelledby="seo-title">
      <div class="wrap seo__inner">
        <h2 class="seo__title" id="seo-title">Gadżety reklamowe z logo i drukarnia w&nbsp;Kaliszu</h2>
        <p class="seo__lede">
          REED to firma poligraficzno-reklamowa z Kalisza, działająca od 2002 roku. W jednym miejscu dobierzesz
          <a href={to('GADŻETY REKLAMOWE')}>gadżety reklamowe</a> z nadrukiem, upominki firmowe i materiały drukowane
          oraz zlecisz ich znakowanie.
          {#if catalogueCount}Katalog liczy ponad {catalogueCount} produktów, a znakujemy je{:else}Produkty z katalogu
            znakujemy{/if} we własnej pracowni: grawerem laserowym, tampodrukiem i drukiem cyfrowym.
        </p>

        <div class="seo__cols">
          <section class="seo__block">
            <h3>Gadżety reklamowe z nadrukiem</h3>
            <p>
              W katalogu znajdziesz <a href={to('ARTYKUŁY PIŚMIENNICZE')}>długopisy z logo</a>
              (<a href={to('Długopisy metalowe')}>metalowe</a>, <a href={to('Długopisy plastikowe')}>plastikowe</a>,
              <a href={to('Długopisy ekologiczne')}>ekologiczne</a> i
              <a href={to('Długopisy żelowe i półżelowe')}>żelowe</a>), a także
              <a href={to('Kubki')}>kubki reklamowe</a>, <a href={to('Kubki izotermiczne')}>kubki termiczne</a>,
              <a href={to('Bidony, butelki')}>bidony</a>, <a href={to('Torby na zakupy')}>torby na zakupy</a>,
              <a href={to('Plecaki')}>plecaki</a>, <a href={to('Parasole')}>parasole</a> i
              <a href={to('Smycze reklamowe')}>smycze reklamowe</a>. Na biurko: <a href={to('Notesy')}>notesy</a>,
              <a href={to('Karteczki memo')}>karteczki memo</a>,
              <a href={to('Podkładki pod mysz')}>podkładki pod mysz</a> i
              <a href={to('Kalkulatory')}>kalkulatory</a>. Z elektroniki:
              <a href={to('Powerbanki')}>powerbanki</a>, <a href={to('Pendrive')}>pendrive'y</a> i
              <a href={to('Głośniki')}>głośniki</a>.
            </p>
          </section>

          <section class="seo__block">
            <h3>Upominki firmowe premium</h3>
            <p>
              Na prezenty dla klientów i pracowników: pióra i długopisy <a href={to('Parker')}>Parker</a> i
              <a href={to('Waterman')}>Waterman</a>, scyzoryki <a href={to('Victorinox')}>Victorinox</a>, akcesoria
              <a href={to('Pierre Cardin')}>Pierre Cardin</a> oraz <a href={to('Zestawy do wina')}>zestawy do wina</a>.
              Na całej <a href={to('PREMIUM')}>kolekcji premium</a> wygrawerujemy logo lub dedykację.
            </p>
          </section>

          <section class="seo__block">
            <h3>Znakowanie: grawer laserowy, tampodruk, druk cyfrowy</h3>
            <p>
              Logo nanosimy sami, na miejscu w Kaliszu. Grawer laserowy daje trwałe oznakowanie na metalu: długopisach,
              kubkach termicznych, scyzorykach i tabliczkach. Tampodruk przenosi kolorowy nadruk na plastik i
              powierzchnie zaokrąglone. Druk cyfrowy odwzorowuje pełnokolorowe grafiki. Przy produktach podajemy pole i
              miejsce znakowania oraz cennik z nadrukiem, więc od razu widać, ile kosztuje gadżet z Twoim logo.
            </p>
          </section>

          <section class="seo__block">
            <h3>Drukarnia: wizytówki, ulotki, druki samokopiujące</h3>
            <p>
              Drukujemy <a href={to('WIZYTÓWKI')}>wizytówki</a>, <a href={to('ULOTKI')}>ulotki</a>,
              <a href={to('TECZKI')}>teczki firmowe</a>, <a href={to('NOTESY KLEJONE')}>notesy klejone</a>,
              <a href={to('KARTECZKI W PUDEŁKU')}>karteczki w pudełku</a>,
              <a href={to('NAKLEJKI I ETYKIETY SAMOPRZYLEPNE')}>naklejki i etykiety samoprzylepne</a> oraz
              <a href={to('TORBY PAPIEROWE')}>torby papierowe z nadrukiem</a>. Przygotowujemy
              <a href={to('DRUKI SAMOKOPIUJĄCE')}>druki samokopiujące</a>:
              <a href={to('Standardowe druki dla FIRM')}>standardowe druki dla firm</a>,
              <a href={to('Druki dla firm TRANSPORTOWYCH')}>druki dla firm transportowych</a>,
              <a href={to('Druki dla KOMINIARZY')}>druki dla kominiarzy</a> i
              <a href={to('Druki samokopiujące na ZAMÓWIENIE')}>druki na zamówienie</a> według własnego wzoru. Robimy
              też
              <a href={to('KARTKI ŚWIĄTECZNE DLA FIRM')}>kartki świąteczne dla firm</a> i
              <a href={to('DRUK INSTRUKCJI OBSŁUGI')}>druk instrukcji obsługi</a>.
            </p>
          </section>

          <section class="seo__block">
            <h3>Kalendarze firmowe z logo</h3>
            <p>
              <a href={to('KSIĄŻKOWE')}>Kalendarze książkowe</a> w formatach A4, A5, B5 i A6,
              <a href={to('ŚCIENNE')}>kalendarze ścienne</a> jedno- i trójdzielne oraz
              <a href={to('BIURKOWE')}>kalendarze biurkowe</a>, wszystkie z logo i danymi firmy. Cały wybór w dziale
              <a href={to('KALENDARZE')}>kalendarze reklamowe</a>.
            </p>
          </section>

          <section class="seo__block">
            <h3>Pieczątki, tabliczki i reklama zewnętrzna</h3>
            <p>
              Wykonujemy <a href={to('PIECZĄTKI')}>pieczątki</a> firmowe i imienne,
              <a href={to('TABLICZKI GRAWEROWANE')}>tabliczki grawerowane</a> (m.in.
              <a href={to('Tabliczki z laminatu')}>tabliczki z laminatu</a> na drzwi i urządzenia) oraz
              <a href={to('REKLAMA ZEWNĘTRZNA')}>reklamę zewnętrzną</a> dla firm.
            </p>
          </section>

          <section class="seo__block">
            <h3>Kalisz i okolice, wysyłka w całej Polsce</h3>
            <p>
              Biuro mieści się w Kaliszu przy ul. Dobrzeckiej 95 (pn–pt 10:00–14:00). Najbliżej do nas mają klienci z
              Kalisza, Ostrowa Wielkopolskiego, Pleszewa, Jarocina, Turku, Krotoszyna, Konina i Sieradza, a zamówienia z
              każdego miejsca w Polsce wysyłamy pod wskazany adres. <a href="/kontakt">Napisz do nas lub zadzwoń</a>, a
              pomożemy dobrać produkt i sposób znakowania.
            </p>
          </section>
        </div>
      </div>
    </section>

    {#if summary?.sections?.length}
      <section class="map">
        <div class="wrap">
          <h2 class="map__title">Pełna mapa katalogu</h2>
          <div class="map__cols">
            {#each summary.sections as s (s.id)}
              <div class="map__col">
                <a class="map__head" href={s.href}>{s.name}</a>
                {#if s.children.length}
                  <ul class="map__list">
                    {#each s.children as c (c.id)}
                      <li class="map__group">
                        <a class="map__sub" href={`/kategorie/${c.slug}`}>{c.name}</a>
                        {#if c.children.length}
                          <ul class="map__leaves">
                            {#each c.children as g (g.id)}
                              <li><a href={`/kategorie/${g.slug}`}>{g.name}</a></li>
                            {/each}
                          </ul>
                        {/if}
                      </li>
                    {/each}
                  </ul>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </section>
    {/if}

    <!-- The page ends on the question, not on the links. Confirmed claims only (no turnaround). -->
    <section class="ask" aria-labelledby="ask-title">
      <div class="wrap ask__inner">
        <div class="ask__copy">
          <h2 class="ask__title" id="ask-title">Nie wiesz, co wybrać?</h2>
          <p class="ask__lede">
            <span class="ask__s">Napisz albo zadzwoń, pomożemy dobrać produkt i&nbsp;znakowanie.</span>
            <span class="ask__s">Biuro w&nbsp;Kaliszu, pn–pt 10:00–14:00.</span>
          </p>
        </div>
        <div class="ask__acts hang">
          <a class="btn btn--orange" href="/kontakt">Napisz do nas</a>
          <a class="btn ask__tel tnum" href={tel}>{business.telephone}</a>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  /* --- hero --- */

  /* A blueprint's grid over the whole field, coming in from the top centre and fading out in an ellipse sized to the
     hero, so on a wide page it reaches out to the sides too, and gone by the bottom (the machine is drawn on it): the
     navy over it clears from the middle out. */
  .hero {
    --grid: rgb(230 237 247 / 0.07);
    border-bottom: var(--rule);
    background-color: var(--navy);
    background-image:
      radial-gradient(75% 100% at 50% 0, transparent 30%, var(--navy) 100%),
      linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px);
    background-position:
      0 0,
      center top,
      center top;
    background-size:
      auto,
      1.5rem 1.5rem,
      1.5rem 1.5rem;
    color: #fff;
  }
  .hero__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--sp-8);
    align-items: center;
    max-width: var(--page);
    margin-inline: auto;
    /* more room above than below, both growing with the page (about 56 / 44px at 900px, 72 / 56 at 1440) */
    padding: clamp(2.5rem, 1.85rem + 3vw, 5.5rem) var(--gutter) clamp(2rem, 1.5rem + 2.2vw, 4rem);
  }
  .hero__copy {
    min-width: 0;
  }
  .hero__plate {
    min-width: 0;
  }
  /* the machine, drawn (see HeroMachine): it stands on its own floor line, so no shadow (its viewBox ends there: the
     hatching under it shows past it) */
  .hero__machine {
    display: block;
    width: 100%;
    aspect-ratio: 716 / 422;
  }
  /* the reference orange: the smaller oranges are tuned to look like this one */
  .hero__title em {
    color: var(--orange);
  }
  .hero__title {
    font-size: var(--fs-hero);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 0.96;
    max-width: 16ch;
  }
  /* the last sentence a line of its own (two where it doesn't fit one) */
  .hero__own {
    display: block;
  }
  .hero__lede {
    margin-top: var(--sp-5);
    max-width: 50ch;
    color: #cfdcee;
    font-size: clamp(1rem, 0.95rem + 0.35vw, 1.125rem);
    line-height: 1.45;
  }
  .hero__acts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-3);
    margin-top: var(--sp-7);
  }

  /* --- SEO band --- */

  .seo {
    border-top: var(--rule);
    background-color: var(--navy);
    color: #cfdcee;
  }
  .seo__inner {
    padding-block: var(--sp-12);
  }
  .seo__title {
    max-width: 24ch;
    color: #fff;
    font-size: var(--fs-h2);
    text-wrap: balance;
  }
  .seo__lede {
    max-width: 62ch;
    margin-top: var(--sp-4);
    color: #e3ebf6;
    font-size: clamp(1rem, 0.95rem + 0.3vw, 1.125rem);
    line-height: 1.6;
  }
  /* Keep each block whole across columns. */
  .seo__cols {
    margin-top: var(--sp-8);
    columns: 1;
    column-gap: var(--sp-10);
    column-rule: 1px solid #2d4468;
  }
  .seo__block {
    break-inside: avoid;
    margin-bottom: var(--sp-6);
  }
  .seo__block h3 {
    margin-bottom: var(--sp-2);
    color: #fff;
    font-size: var(--fs-h3);
    text-wrap: balance;
  }
  .seo__block p {
    font-size: var(--fs-sm);
    line-height: 1.65;
  }
  .seo a[href] {
    color: #fff;
    text-decoration: underline;
    text-decoration-color: rgba(255, 255, 255, 0.35);
    text-underline-offset: 0.2em;
    transition:
      color var(--dur-fast) var(--ease-hover),
      text-decoration-color var(--dur-fast) var(--ease-hover);
  }
  /* (white: orange on the navy means contact) */
  .seo a[href]:hover {
    text-decoration-color: currentColor;
  }
  @media (min-width: 47.5rem) {
    .seo__cols {
      columns: 2;
    }
  }
  @media (min-width: 75rem) {
    .seo__cols {
      columns: 3;
    }
  }

  /* --- catalogue map --- */

  .map {
    border-top: var(--rule);
    background-color: var(--paper-2);
    padding: var(--sp-10) 0 var(--sp-12);
  }
  .map__title {
    margin-bottom: var(--sp-6);
    font-size: var(--fs-h2);
  }
  /* Columns, not grid rows: sections have 0 to 9 children. */
  /* Two columns even on a phone: long names hyphenate, the map is half as tall. */
  .map__cols {
    columns: 2;
    column-gap: var(--sp-5);
    hyphens: auto;
    overflow-wrap: break-word;
  }
  /* Sections may break across columns; subcategory groups don't. */
  .map__col {
    margin-bottom: var(--sp-6);
  }
  .map__group {
    break-inside: avoid;
    margin-bottom: var(--sp-3);
  }
  .map__head {
    display: block;
    break-after: avoid;
    padding-bottom: var(--sp-2);
    margin-bottom: var(--sp-3);
    border-bottom: 1px solid var(--border-strong);
    color: var(--ink);
    font-size: var(--fs-sm);
    font-weight: 700;
  }
  .map__head:hover {
    color: var(--red);
  }
  .map__list,
  .map__leaves {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .map__sub {
    display: block;
    color: var(--ink);
    font-size: var(--fs-sm);
    font-weight: 600;
    line-height: 1.4;
  }
  .map__sub:hover {
    color: var(--red);
  }
  .map__leaves {
    margin-top: 0.1875rem;
    padding-left: var(--sp-3);
    border-left: 1px solid var(--border);
  }
  .map__leaves a {
    display: block;
    padding: 0.0625rem 0;
    color: var(--ink-500);
    font-size: var(--fs-xs);
    line-height: 1.4;
  }
  .map__leaves a:hover {
    color: var(--red);
  }
  /* rows a finger can hit */
  @media (pointer: coarse) {
    .map__sub,
    .map__leaves a {
      padding-block: 0.3125rem;
    }
  }

  /* --- closing question --- */

  .ask {
    border-top: var(--rule);
    background-color: var(--bg);
  }
  /* Text, then its buttons under it, like the hero's and Siedziba's. */
  .ask__inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-6);
    padding-block: var(--sp-12);
  }
  .ask__title {
    font-size: var(--fs-h1);
    letter-spacing: -0.03em;
  }
  .ask__lede {
    max-width: 52ch;
    margin-top: var(--sp-3);
    color: var(--text-muted);
    font-size: clamp(1rem, 0.95rem + 0.3vw, 1.125rem);
    line-height: 1.5;
  }
  /* a line per sentence (as Siedziba's) */
  .ask__s {
    display: block;
  }
  .ask__acts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-3);
  }
  /* the phone is contact too: the orange's outline */
  .ask__tel {
    border-color: var(--orange);
    color: var(--orange-deep);
  }
  .ask__tel:hover {
    background-color: var(--orange);
    color: var(--ink);
  }

  /* Spacing between blocks (replaces the old PRZERWA element). */
  .blocks {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding-top: var(--sp-10);
    padding-bottom: var(--sp-12);
  }
  /* Each block carries its own measure, so a band can go full-bleed. */
  .blocks > :global(*) {
    width: 100%;
    max-width: var(--page);
    margin-inline: auto;
    padding-inline: var(--gutter);
  }
  .blocks > :global([data-bleed]) {
    max-width: none;
    padding-inline: 0;
  }
  /* Siedziba is ruled top and bottom, but never twice where it follows the hero. */
  .blocks > :global([data-type='headquarters']) {
    border-block: var(--rule);
  }
  .blocks > :global([data-type='headquarters']:first-child) {
    border-top: 0;
  }
  .blocks > :global(* + *) {
    margin-top: var(--sp-10);
  }
  .blocks > :global([data-type='title'] + *) {
    margin-top: var(--sp-5);
  }
  .blocks > :global(* + [data-type='title']) {
    margin-top: var(--sp-16);
  }
  .blocks > :global([data-fixed] + [data-type='title']) {
    margin-top: var(--sp-10);
  }
  /* A leading band meets the hero directly, and so do leading banners (in the column, apart: see Tiles), lying partly
     on it: its navy goes on behind their top, no rule between them. */
  .blocks > :global([data-bleed]:first-child),
  .blocks > :global([data-type='tiles']:first-child) {
    margin-top: calc(var(--sp-10) * -1);
  }
  :global(.shell__main:has(> .blocks > [data-type='tiles']:first-child) > .hero) {
    border-bottom: 0;
  }
  :global(.shell__main > .blocks:has(> [data-type='tiles']:first-child)) {
    background-image: linear-gradient(var(--navy) clamp(3rem, 2rem + 3vw, 6rem), transparent 0);
  }

  @media (min-width: 38.75rem) {
    .map__cols {
      column-gap: var(--sp-8);
    }
  }

  /* Phone and narrow tablet: the machine first, under the bar, as wide as the text column and on its edge. */
  @media (max-width: 47.4988rem) {
    .hero__inner {
      gap: var(--sp-5);
      padding-top: var(--sp-8);
    }
    /* "do kieszeni. Porządnie," on one line (about 10em): the title a little smaller where that takes it, at most
       10% (narrower still, the line breaks after "kieszeni.") */
    .hero__title {
      font-size: max(calc(var(--fs-hero) * 0.9), min(var(--fs-hero), calc((100vw - 2 * var(--gutter)) / 10.1)));
    }
    .hero__plate {
      order: -1;
    }
    /* Stacked, each fills its line (and hangs on both sides) instead of two ragged widths. */
    .hero__acts,
    .ask__acts {
      margin-inline: calc(-1 * var(--pill-hang));
    }
    .hero__acts > .btn,
    .ask__acts > .btn {
      flex: 1 1 auto;
    }
    .ask__acts {
      align-self: stretch;
    }
  }

  /* Beside the rail and up: the title across, under it the lede and buttons, and the machine beside them, standing on
     the row's foot at the right, so its floor line is level with the buttons' bottom: as tall as the title, lede and
     buttons together, or scaled down as far as it takes not to touch any of them (see heroFit, which also puts
     "Porządnie," on its own line where that lets it be bigger; before it's run, as wide as its column). Absolute in
     its cell, it adds nothing to the row: the row is the lede's and buttons', right under the title. */
  @media (min-width: 47.5rem) {
    /* (its rows explicit: the machine, absolute, stands on the second's foot) */
    .hero__inner {
      position: relative;
      grid-template-columns: minmax(15rem, 1fr) minmax(0, 1.6fr);
      grid-template-rows: auto auto;
      column-gap: var(--sp-8);
      row-gap: 0;
      align-items: end;
    }
    .hero__copy {
      display: contents;
    }
    .hero__title {
      grid-column: 1 / -1;
    }
    .hero__body {
      grid-column: 1;
      grid-row: 2;
    }
    /* (both lines named: an absolute item's "auto" end is the padding's edge) */
    .hero__plate {
      position: absolute;
      grid-column: 2 / 3;
      grid-row: 2 / 3;
      right: 0;
      bottom: 0;
      width: var(--machine-w, 100%);
    }
  }
  /* "Porządnie," after "do kieszeni." or on its own line (heroFit's choice, set by it: global; before it's run, from
     90rem) */
  .hero__br {
    display: none;
  }
  @media (min-width: 90rem) {
    .hero__br {
      display: inline;
    }
  }
  .hero__title:global([data-break='1']) .hero__br {
    display: inline;
  }
  .hero__title:global([data-break='0']) .hero__br {
    display: none;
  }

  @media (min-width: 68.75rem) {
    .map__cols {
      columns: 4;
    }
  }
</style>
