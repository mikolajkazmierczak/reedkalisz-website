<script>
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { deep, treeFlatten } from '%/utils';
  import SideRail from '#/shell/SideRail.svelte';

  import { layout, modified } from '#/layout/store';
  import { create, parseLayout, parseBack } from '#/layout/utils';
  import ElementLabels from '#/layout/ElementLabels.svelte';
  import Element from '#/layout/Element.svelte';
  import Title from '#/layout/elements/Title.svelte';
  import Tiles from '#/layout/elements/tiles/Tiles.svelte';
  import Category from '#/layout/elements/Category.svelte';
  import SectionIcon from '#c/SectionIcon.svelte';
  import { plural } from '#/utils';
  import { SITE, jsonLd, business } from '#/seo';

  const cities = ['Kalisz', 'Ostrów Wielkopolski', 'Pleszew', 'Jarocin', 'Turek', 'Krotoszyn', 'Konin', 'Sieradz'];

  const types = [
    { type: 'title', label: 'Tytuł', icon: 'text_t' },
    { type: 'tiles', label: 'Kafelki', icon: 'apps' },
    { type: 'category', label: 'Kategoria', icon: 'categories' },
  ];

  export let data;

  let loadedLayout = null;
  let originalLayout = [];
  let parsedLayout = [];

  $: refresh(data); // DO NOT just assign `data.layout` to `parsedLayout` because all hell breaks loose
  $: $layout = parseBack(deep.copy(parsedLayout));
  $: $modified = !deep.same(originalLayout, $layout);

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
      const n = name.replace(/^[^\p{L}]+/u, '').trim();
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

  function handleDelete(id) {
    parsedLayout = parsedLayout.filter((e) => e._id !== id);
  }

  function handleAdd(e, id = null) {
    const createElement = (type) => {
      if (type === 'title') {
        return create.title({ title: 'Tytuł' });
      } else if (type === 'tiles') {
        return create.tiles({ tiles: [] });
      } else if (type === 'category') {
        const slug = categories[0].id;
        return create.category({ slug });
      }
    };

    const element = createElement(e.detail.type);
    if (id === null) {
      parsedLayout = [element, ...parsedLayout];
    } else {
      const i = parsedLayout.findIndex((e) => e._id === id);
      parsedLayout.splice(i + 1, 0, element);
      parsedLayout = parsedLayout;
    }
  }

  function handleMove(e, id) {
    const direction = e.detail.direction; // 'up' or 'down'

    const i = parsedLayout.findIndex((e) => e._id === id);
    const j = direction === 'up' ? i - 1 : i + 1;

    if (j >= 0 && j < parsedLayout.length) {
      [parsedLayout[i], parsedLayout[j]] = [parsedLayout[j], parsedLayout[i]];
      parsedLayout = parsedLayout;
    }
  }

  beforeNavigate((navigation) => {
    if ($modified) {
      if (confirm('Zmiany nie zostały zapisane. Czy na pewno chcesz opuścić stronę?')) {
        $modified = false;
      } else navigation.cancel();
    }
  });
</script>

<svelte:head>
  <title>REED Kalisz — gadżety reklamowe, druk, grawer laserowy</title>
  <meta
    name="description"
    content="Gadżety reklamowe z logo, druk cyfrowy, grawerowanie laserowe i pieczątki. Znakowanie robimy u siebie w Kaliszu od 2002 roku." />
  <meta property="og:title" content="REED Kalisz — gadżety reklamowe, druk, grawer laserowy" />
  <meta property="og:image" content="{SITE}/imgs/machine-playful.webp" />
  {@html jsonLd(business)}
</svelte:head>

<div class="shell">
  <SideRail items={data.menus.side} />

  <div class="shell__main">
    <section class="hero">
      <div class="hero__inner">
        <div class="hero__copy">
          <h1 class="hero__title two-tone">
            Na biurko, na&nbsp;ścianę,<br /> do&nbsp;kieszeni. <em>Porządnie,<br /> z&nbsp;Twoim logo.</em>
          </h1>
          <p class="hero__lede">
            Doradzimy przy wyborze i oznakujemy — grawerem laserowym, tampodrukiem, drukiem cyfrowym. Na własnych
            maszynach, w&nbsp;Kaliszu, od 2002 roku.
          </p>
          <div class="hero__acts">
            <a class="btn btn--light" href="/kategorie/_">
              {catalogueCount ? `Katalog ${catalogueCount}+ produktów` : 'Przejdź do katalogu'}
            </a>
            <a class="btn btn--ghost-light" href="/kontakt">Napisz do nas</a>
          </div>
        </div>
        <div class="hero__plate" aria-hidden="true">
          <img
            class="hero__machine"
            src="/imgs/machine-playful.webp"
            alt=""
            width="1536"
            height="1024"
            fetchpriority="high" />
        </div>
      </div>
    </section>

    {#if summary?.sections?.length}
      <section class="sections">
        <div class="sections__grid">
          {#each summary.sections as s (s.id)}
            <a class="sec" href={s.href}>
              <div class="sec__icon"><SectionIcon name={s.name} /></div>
              <div class="sec__text">
                <!-- remove emojis since the drawings replace them -->
                <h2 class="sec__name">{s.name.replace(/^[^\p{L}\p{N}]+/u, '')}</h2>
                <span class="sec__count tnum">{s.count} {plural(s.count, ['pozycja', 'pozycje', 'pozycji'])}</span>
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/if}

    <section class="reach">
      <div class="wrap reach__inner">
        <h2 class="reach__title">Siedziba w Kaliszu, wysyłkowo cała Polska</h2>
        <p class="reach__lede">
          <span class="reach__s"
            >Z Kalisza i okolic wpadnij do nas na Dobrzecką 95, od poniedziałku do piątku między 10:00 a&nbsp;14:00.</span>
          <span class="reach__s">Paczki wysyłamy na terenie całej Polski — prosto pod Twój adres.</span>
        </p>
        <ul class="cities">
          {#each cities as city}
            <li class="city" class:city--home={city === 'Kalisz'}>{city}</li>
          {/each}
        </ul>

        <a class="btn btn--orange" href="/kontakt">Umów się albo napisz</a>
      </div>
    </section>

    <div class="blocks">
      <ElementLabels {types} on:add={(e) => handleAdd(e)} />
      {#each parsedLayout as element}
        {@const { _id: id, type } = element}
        <Element bind:element {types} {type} on:delete={() => handleDelete(id)} on:move={(e) => handleMove(e, id)}>
          {#if type === 'title'}
            <Title bind:element />
          {:else if type === 'category'}
            <Category bind:element {categories} />
          {:else if type === 'tiles'}
            <Tiles bind:element />
          {/if}
        </Element>
        <ElementLabels {types} on:add={(e) => handleAdd(e, id)} />
      {/each}
    </div>

    <!-- SEO copy. Confirmed claims only: no turnaround, minimums or client names. -->
    <section class="seo" aria-labelledby="seo-title">
      <div class="wrap seo__inner">
        <h2 class="seo__title" id="seo-title">Gadżety reklamowe z logo i drukarnia w&nbsp;Kaliszu</h2>
        <p class="seo__lede">
          REED to firma poligraficzno-reklamowa z Kalisza, działająca od 2002 roku. W jednym miejscu dobierzesz
          <a href={to('GADŻETY REKLAMOWE')}>gadżety reklamowe</a> z nadrukiem, upominki firmowe i materiały drukowane —
          i zlecisz ich znakowanie.
          {#if catalogueCount}Katalog liczy ponad {catalogueCount} produktów, a znakujemy je{:else}Produkty z katalogu
            znakujemy{/if} we własnej pracowni: grawerem laserowym, tampodrukiem i drukiem cyfrowym.
        </p>

        <div class="seo__cols">
          <section class="seo__block">
            <h3>Gadżety reklamowe z nadrukiem</h3>
            <p>
              W katalogu znajdziesz <a href={to('ARTYKUŁY PIŚMIENNICZE')}>długopisy z logo</a> —
              <a href={to('Długopisy metalowe')}>metalowe</a>, <a href={to('Długopisy plastikowe')}>plastikowe</a>,
              <a href={to('Długopisy ekologiczne')}>ekologiczne</a> i
              <a href={to('Długopisy żelowe i półżelowe')}>żelowe</a> — a także
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
              <a href={to('Pierre Cardin')}>Pierre Cardin</a> oraz <a href={to('Zestawy do wina')}>zestawy do wina</a> —
              cała <a href={to('PREMIUM')}>kolekcja premium</a> z możliwością grawerowania logo lub dedykacji.
            </p>
          </section>

          <section class="seo__block">
            <h3>Znakowanie: grawer laserowy, tampodruk, druk cyfrowy</h3>
            <p>
              Logo nanosimy sami, na miejscu w Kaliszu. Grawer laserowy daje trwałe oznakowanie na metalu — długopisach,
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
              <a href={to('DRUKI SAMOKOPIUJĄCE')}>druki samokopiujące</a> —
              <a href={to('Standardowe druki dla FIRM')}>standardowe druki dla firm</a>,
              <a href={to('Druki dla firm TRANSPORTOWYCH')}>druki dla firm transportowych</a>,
              <a href={to('Druki dla KOMINIARZY')}>druki dla kominiarzy</a> i
              <a href={to('Druki samokopiujące na ZAMÓWIENIE')}>druki na zamówienie</a> według własnego wzoru — a także
              <a href={to('KARTKI ŚWIĄTECZNE DLA FIRM')}>kartki świąteczne dla firm</a> i
              <a href={to('DRUK INSTRUKCJI OBSŁUGI')}>druk instrukcji obsługi</a>.
            </p>
          </section>

          <section class="seo__block">
            <h3>Kalendarze firmowe z logo</h3>
            <p>
              <a href={to('KSIĄŻKOWE')}>Kalendarze książkowe</a> w formatach A4, A5, B5 i A6,
              <a href={to('ŚCIENNE')}>kalendarze ścienne</a> jedno- i trójdzielne oraz
              <a href={to('BIURKOWE')}>kalendarze biurkowe</a> — z logo i danymi firmy. Cały wybór w dziale
              <a href={to('KALENDARZE')}>kalendarze reklamowe</a>.
            </p>
          </section>

          <section class="seo__block">
            <h3>Pieczątki, tabliczki i reklama zewnętrzna</h3>
            <p>
              Wykonujemy <a href={to('PIECZĄTKI')}>pieczątki</a> firmowe i imienne,
              <a href={to('TABLICZKI GRAWEROWANE')}>tabliczki grawerowane</a> — m.in.
              <a href={to('Tabliczki z laminatu')}>tabliczki z laminatu</a> na drzwi i urządzenia — oraz
              <a href={to('REKLAMA ZEWNĘTRZNA')}>reklamę zewnętrzną</a> dla firm.
            </p>
          </section>

          <section class="seo__block">
            <h3>Kalisz i okolice, wysyłka w całej Polsce</h3>
            <p>
              Biuro mieści się w Kaliszu przy ul. Dobrzeckiej 95 (pn–pt 10:00–14:00). Najbliżej do nas mają klienci z
              Kalisza, Ostrowa Wielkopolskiego, Pleszewa, Jarocina, Turku, Krotoszyna, Konina i Sieradza — a zamówienia
              z każdego miejsca w Polsce wysyłamy pod wskazany adres. <a href="/kontakt">Napisz do nas lub zadzwoń</a> — pomożemy
              dobrać produkt i sposób znakowania.
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
  </div>
</div>

<style>
  /* --- hero --- */

  .hero {
    border-bottom: var(--rule);
    background-color: var(--red);
    color: #fff;
  }
  .hero__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--sp-8);
    align-items: center;
    padding: var(--sp-10) var(--gutter) var(--sp-8);
  }
  .hero__copy {
    min-width: 0;
  }
  .hero__plate {
    min-width: 0;
  }
  .hero__machine {
    display: block;
    width: 100%;
    max-width: 30rem;
    height: auto;
    aspect-ratio: 3 / 2;
    object-fit: contain;
  }
  .hero__title {
    font-size: var(--fs-hero);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 0.96;
    max-width: 16ch;
  }
  .hero__lede {
    margin-top: var(--sp-5);
    max-width: 50ch;
    color: #f6cdd1;
    font-size: clamp(1rem, 0.95rem + 0.35vw, 1.125rem);
    line-height: 1.45;
  }
  .hero__acts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-3);
    margin-top: var(--sp-7);
  }

  /* --- catalogue sections --- */

  .sections {
    border-bottom: var(--rule);
    background-color: var(--surface);
  }
  /* Rules are the grid background showing through a 1px gap; the last cell spans a short row. */
  .sections__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1px;
    background-color: var(--border);
  }
  .sec {
    display: flex;
    align-items: center;
    gap: var(--sp-4);
    -webkit-user-select: none;
    user-select: none;
    padding: var(--sp-4) var(--gutter);
    background-color: var(--surface);
    color: var(--ink);
    transition:
      background-color var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease);
  }
  .sec:hover {
    background-color: var(--paper-2);
    color: var(--red);
  }
  .sec__icon {
    flex: none;
    width: 3.25rem;
    color: var(--ink);
    transition: transform var(--dur) var(--ease);
  }
  .sec:hover .sec__icon {
    transform: translateY(-0.1875rem);
  }
  @media (prefers-reduced-motion: reduce) {
    .sec:hover .sec__icon {
      transform: none;
    }
  }
  .sec__text {
    display: flex;
    flex-direction: column;
    gap: var(--sp-1);
    min-width: 0;
  }
  .sec__name {
    font-size: var(--fs-h3);
    font-weight: 700;
    line-height: 1.15;
  }
  .sec__count {
    color: var(--ink-400);
    font-size: var(--fs-xs);
  }

  /* --- reach band --- */

  .reach {
    border-top: var(--rule);
    border-bottom: var(--rule);
    background-color: var(--navy);
    color: #fff;
  }
  .reach__inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-3);
    padding: var(--sp-8) var(--gutter);
  }
  .reach__title {
    max-width: 22ch;
    font-size: var(--fs-h2);
    color: #fff;
  }
  /* One paragraph on phones, a line per sentence from 56.25rem. */
  .reach__lede {
    max-width: 58ch;
    color: #a9bcd6;
    font-size: var(--fs-sm);
    line-height: 1.6;
  }
  @media (min-width: 56.25rem) {
    .reach__lede {
      max-width: none;
    }
    .reach__s {
      display: block;
    }
  }
  /* A separator before each town, shifted and clipped so no line starts with one. */
  .cities {
    --sep: calc(1px + var(--sp-3));
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2) var(--sp-3);
    margin: var(--sp-3) 0 var(--sp-1) calc(var(--sep) * -1);
    padding: 0;
    list-style: none;
    clip-path: inset(0 0 0 var(--sep));
  }
  .city {
    display: flex;
    align-items: center;
    color: #cfdcee;
    font-size: var(--fs-sm);
  }
  .city::before {
    content: '';
    width: 1px;
    height: 0.9em;
    margin-right: var(--sp-3);
    background-color: #3c567d;
  }
  .city--home {
    color: #fff;
    font-weight: 700;
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
      color var(--dur-fast) var(--ease),
      text-decoration-color var(--dur-fast) var(--ease);
  }
  .seo a[href]:hover {
    color: var(--orange-bright);
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
  .map__cols {
    columns: 1;
    column-gap: var(--sp-8);
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
    margin-top: 3px;
    padding-left: var(--sp-3);
    border-left: 1px solid var(--border);
  }
  .map__leaves a {
    display: block;
    padding: 1px 0;
    color: var(--ink-500);
    font-size: var(--fs-xs);
    line-height: 1.4;
  }
  .map__leaves a:hover {
    color: var(--red);
  }

  /* Spacing between blocks (replaces the old PRZERWA element). */
  .blocks {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding-top: var(--sp-10);
    padding-bottom: var(--sp-12);
  }
  /* Each block carries its own measure, so banners can go full-bleed. */
  .blocks > :global(*) {
    width: 100%;
    max-width: var(--page);
    margin-inline: auto;
    padding-inline: var(--gutter);
  }
  .blocks > :global([data-type='tiles']) {
    max-width: none;
    padding-inline: 0;
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
  /* Consecutive banners touch. */
  .blocks > :global([data-type='tiles'] + [data-type='tiles']) {
    margin-top: 0;
  }
  /* A leading banner meets the section above directly. */
  .blocks > :global([data-type='tiles']:first-child) {
    margin-top: calc(var(--sp-10) * -1);
  }

  @media (min-width: 38.75rem) {
    .map__cols {
      columns: 2;
    }
    .sections__grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .sec:last-child:nth-child(2n + 1) {
      grid-column: 1 / -1;
    }
  }

  @media (min-width: 56.25rem) {
    .hero__inner {
      padding: var(--sp-12) var(--gutter);
    }
  }

  /* Phone: machine first, pulled up under the clear top bar (see MobileBar). */
  @media (max-width: 47.4988rem) {
    .hero {
      --bar: calc(var(--topbar-h) + 2px);
      margin-top: calc(var(--bar) * -1);
      padding-top: var(--bar);
      background-image: linear-gradient(
        var(--paper) 0 var(--topbar-h),
        var(--ink) var(--topbar-h) var(--bar),
        var(--red) var(--bar)
      );
    }
    .hero__inner {
      gap: var(--sp-3);
      padding-top: 0;
    }
    .hero__plate {
      order: -1;
      margin-top: -1.25rem;
    }
    .hero__machine {
      margin-inline: auto;
    }
  }

  /* Mid widths: full-width title, machine beside the lede and buttons. */
  @media (min-width: 47.5rem) and (max-width: 82.4988rem) {
    .hero__inner {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      column-gap: var(--sp-8);
      row-gap: 0;
    }
    .hero__copy {
      display: contents;
    }
    .hero__title {
      grid-column: 1 / -1;
    }
    .hero__lede {
      grid-column: 1;
      grid-row: 2;
    }
    .hero__acts {
      grid-column: 1;
      grid-row: 3;
      align-self: start;
    }
    .hero__plate {
      grid-column: 2;
      grid-row: 2 / span 2;
      align-self: center;
      margin-top: var(--sp-5);
    }
    .hero__machine {
      max-width: none;
    }
  }

  /* Wide: machine beside the whole title; copy column sized to the title. */
  @media (min-width: 82.5rem) {
    .hero__inner {
      grid-template-columns: minmax(0, max-content) minmax(0, 1fr);
      gap: var(--sp-8);
    }
    /* Out of flow, so the image never sets the row height. */
    .hero__plate {
      position: relative;
      align-self: stretch;
      margin-block: calc(var(--sp-6) * -1);
    }
    .hero__machine {
      position: absolute;
      inset: 0;
      max-width: none;
      height: 100%;
      aspect-ratio: auto;
    }
  }

  @media (min-width: 68.75rem) {
    .map__cols {
      columns: 4;
    }
  }

  /* Nine sections, three rows of three. */
  @media (min-width: 64rem) {
    .sections__grid {
      grid-template-columns: repeat(3, 1fr);
    }
    .sec:last-child:nth-child(2n + 1) {
      grid-column: auto;
    }
    .sec:last-child:nth-child(3n + 1) {
      grid-column: 1 / -1;
    }
    .sec:last-child:nth-child(3n + 2) {
      grid-column: span 2;
    }
  }
</style>
