<script>
  import { onMount } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { DOTS, BOX, cell } from '#/layout/elements/poland';
  import { VISITS } from '#/layout/elements/visits';

  const HOME = 'Kalisz'; // where we are: ringed white, a white dot in its centre (on the map and in the list), first
  const LISTED = 12; // the places named in the list (Kalisz and the most visited), each pointing at its dot

  // the website's visitors on the grid: a dot's places counted together, the most visited naming it
  const at = (key) => {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  };
  const seen = new Map();
  for (const [name, lat, lon, visitors] of VISITS) {
    const key = cell(lon, lat);
    const dot = seen.get(key) ?? { key, visitors: 0, name, top: 0 };
    dot.visitors += visitors;
    if (visitors > dot.top) Object.assign(dot, { name, top: visitors });
    seen.set(key, dot);
  }
  // bigger and more orange (contact's colour) the more visitors, on a log scale (Warsaw's hundreds and a town's one or
  // two both tell): a visitor or two pale, just bigger than the grid's dots, the most visited big and bright
  const most = Math.max(...[...seen.values()].map((d) => d.visitors));
  const STEPS = 8;
  const step = (visitors) => Math.round((Math.log(visitors) / Math.log(most)) * (STEPS - 1)) / (STEPS - 1);
  const look = (t) => ({
    r: 0.27 + 0.3 * t,
    colour: `color-mix(in oklab, var(--hot) ${Math.round(t * 100)}%, var(--cold))`,
  });

  const dots = [...seen.values()].map((d) => ({ ...d, t: step(d.visitors) }));
  const home = dots.find((d) => d.name === HOME);
  const listed = [home, ...dots.filter((d) => d !== home).sort((a, b) => b.visitors - a.visitors)].slice(0, LISTED);
  const places = listed.map((d) => ({ ...d, ...at(d.key), ...look(d.t), ...(d === home && { r: 0.62 }) }));
  const named = new Set(listed.map((d) => d.key));

  // one path per step: a dot is a zero-length line with round caps, so a thousand of them stay a few kilobytes
  const path = (keys) => keys.map((k) => `M${k.replace(',', ' ')}h.001`).join('');
  const unseen = [...DOTS].filter((k) => !seen.has(k)); // the grid's dots no visitor came from
  const others = dots.filter((d) => !named.has(d.key)); // the places with visitors not in the list
  const plain = path(unseen);
  const steps = new Map();
  for (const d of others) steps.set(d.t, [...(steps.get(d.t) ?? []), d.key]);
  const rest = [...steps].map(([t, keys]) => ({ ...look(t), d: path(keys) }));

  const [left, top, width, height] = BOX;
  const viewBox = [left - 1, top - 1, width + 2, height + 2].join(' ');

  let hovered = null; // a place pointed at, in the list or on the map
  let many = false; // "i wiele innych" pointed at: the rest of the dots grow

  // "Twoje miasto?": pointed at or tapped, one of the grid's grey dots (no visitor from there yet) lights up, asked
  // about; pointed at again, another one
  const grey = unseen.map(at);
  let guess = null;
  function guessAgain() {
    let next = guess;
    while (next === guess && grey.length > 1) next = grey[Math.floor(Math.random() * grey.length)];
    guess = next;
  }
  const mouse = (e) => e.pointerType === 'mouse';

  // every other place with visitors named on the map too: pointed at, its dot grows and is named, as a listed one's
  const spots = others.map((d) => ({ ...d, ...at(d.key), ...look(d.t) }));
  let spot = null;

  // The place lit up on the map - pointed at in the list or on the map, a listed one or not - drawn once more over
  // all the dots, so none hides it: grown and named as it comes, back to its dot as it goes (`--k`, 0 to 1).
  $: lit = hovered ?? spot;
  const light = () => ({ duration: 220, easing: cubicOut, css: (k) => `--k: ${k}` });

  // Kalisz's pulse paused while the map is off screen (an endless animation keeps the page drawing, wherever it is)
  let map;
  let away = false;
  onMount(() => {
    const shown = new IntersectionObserver((entries) => (away = !entries[entries.length - 1].isIntersecting));
    shown.observe(map);
    return () => shown.disconnect();
  });
</script>

<section class="headquarters">
  <div class="wrap headquarters__inner">
    <h2 class="headquarters__title">Siedziba w Kaliszu, wysyłkowo cała Polska</h2>
    <p class="headquarters__lede">
      Z Kalisza i okolic wpadnij do nas na Dobrzecką 95, od poniedziałku do piątku między 10:00 a&nbsp;14:00. Paczki
      wysyłamy na terenie całej Polski, prosto pod Twój adres.
    </p>

    <figure class="headquarters__map">
      <svg
        bind:this={map}
        class="map"
        class:many
        class:away
        {viewBox}
        role="img"
        aria-label="Mapa Polski z siedzibą w Kaliszu i miastami w całej Polsce">
        <path class="dots" d={plain} />
        <g class="rest">
          {#each rest as { r, colour, d }}
            <path {d} style:--w={2 * r} style:stroke={colour} />
          {/each}
        </g>
        <circle class="pulse" cx={places[0].x} cy={places[0].y} r={places[0].r} />
        {#each spots as s (s.key)}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <circle
            class="hit"
            cx={s.x}
            cy={s.y}
            r="0.5"
            on:mouseenter={() => (spot = s)}
            on:mouseleave={() => spot === s && (spot = null)} />
        {/each}
        {#each places as place}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <g
            class="place"
            class:home={place.name === HOME}
            on:mouseenter={() => (hovered = place)}
            on:mouseleave={() => (hovered = null)}>
            <circle class="hit" cx={place.x} cy={place.y} r="0.7" />
            <g class="dot">
              <circle cx={place.x} cy={place.y} r={place.r} style:fill={place.colour} />
              {#if place.name === HOME}<circle class="core" cx={place.x} cy={place.y} r={place.r * 0.4} />{/if}
            </g>
          </g>
        {/each}
        <!-- (a keyed list of one, not an if around a key: a transition only plays when the block right around it
             goes, so this one plays both when another takes its place and when none does) -->
        {#each lit ? [lit] : [] as s (s)}
          <g class="place lit" class:home={s.name === HOME} style:--r={s.r} transition:light>
            <g class="dot">
              <circle cx={s.x} cy={s.y} r={s.r} style:fill={s.colour} />
              {#if s.name === HOME}<circle class="core" cx={s.x} cy={s.y} r={s.r * 0.4} />{/if}
            </g>
            <text class="name" x={s.x} y={s.y - s.r - 0.45}>{s.name}</text>
          </g>
        {/each}
        {#each guess ? [guess] : [] as g (g)}
          <g class="place lit guess" style:--r={0.3} transition:light>
            <g class="dot"><circle cx={g.x} cy={g.y} r="0.3" /></g>
            <text class="name" x={g.x} y={g.y - 0.3 - 0.45}>Twoje miasto?</text>
          </g>
        {/each}
      </svg>
    </figure>

    <div class="headquarters__cities">
      <ul class="cities">
        {#each places as place}
          <li
            class="city"
            class:city--home={place.name === HOME}
            class:on={hovered === place}
            style:--t={place.t}
            style:--colour={place.colour}
            on:mouseenter={() => (hovered = place)}
            on:mouseleave={() => (hovered = null)}>
            <span class="city__name" data-name={place.name}>{place.name}</span>
          </li>
        {/each}
        <li
          class="city city--more"
          class:on={many}
          on:mouseenter={() => (many = true)}
          on:mouseleave={() => (many = false)}>
          <span class="city__name" data-name="i wiele innych">i wiele innych</span>
        </li>
        <li class="city city--guess" class:on={guess}>
          <button
            type="button"
            class="city__name"
            data-name="Twoje miasto?"
            on:pointerenter={(e) => mouse(e) && guessAgain()}
            on:pointerleave={(e) => mouse(e) && (guess = null)}
            on:click={guessAgain}
            on:blur={() => (guess = null)}>Twoje miasto?</button>
        </li>
      </ul>
    </div>

    <a class="btn btn--orange hang headquarters__act" href="/kontakt">Napisz do nas</a>
  </div>
</section>

<style>
  .headquarters {
    --dot: rgb(207 220 238 / 0.3); /* the grid's */
    --cold: #e7b393; /* a visitor or two: the orange, pale */
    --hot: var(--orange-bright); /* the most: contact's orange, lit, to read on the navy */
    background-color: var(--navy);
    color: #fff;
  }
  /* Phones: the text, the map under it, then the towns and the button. Wider: the map beside the text. */
  .headquarters__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'title' 'lede' 'map' 'cities' 'act';
    justify-items: start;
    row-gap: var(--sp-3);
    padding: var(--sp-8) var(--gutter);
  }
  /* a section head, as the Title blocks' and Katalog's */
  .headquarters__title {
    grid-area: title;
    max-width: 22ch;
    font-size: var(--fs-h1);
    letter-spacing: -0.028em;
    color: #fff;
  }
  /* two lines where they fit; more, balanced, so none is left with a word or two */
  .headquarters__lede {
    grid-area: lede;
    max-width: 64ch;
    text-wrap: balance;
    color: #a9bcd6;
    font-size: var(--fs-sm);
    line-height: 1.6;
  }

  .headquarters__map {
    grid-area: map;
    justify-self: stretch;
    margin: var(--sp-4) 0 var(--sp-2);
  }
  .map {
    display: block;
    width: 100%;
    max-width: 26rem;
    margin-inline: auto;
    overflow: visible;
    stroke-linecap: round;
  }
  .dots {
    stroke: var(--dot);
    stroke-width: 0.36;
  }
  /* the places not in the list; "i wiele innych" pointed at, they grow */
  .rest path {
    stroke-width: calc(var(--w) * var(--grow, 1));
    transition: stroke-width var(--dur) var(--ease);
  }
  .map.many .rest {
    --grow: 1.6;
  }
  /* the places in the list (pointed at there or here) and every other one with visitors: lit up (see lit) */
  .place {
    cursor: default;
  }
  .hit {
    fill: transparent;
  }
  .dot {
    transform-box: fill-box;
    transform-origin: center;
  }
  /* Kalisz: orange, ringed white, a white dot in its centre (as in the list) */
  .home .dot circle {
    fill: var(--orange-bright) !important;
    stroke: #fff;
    stroke-width: 0.14;
  }
  .home .dot .core {
    fill: #fff !important;
    stroke: none;
  }
  /* The place lit up, and "Twoje miasto?"'s dot (white, asked about): over all the dots, not taking the pointer from
     them, its dot grown 1.8x and its name over it, bigger; on its way (--k, from 0: see light) from its dot as it is,
     its name unseen. ("Twoje miasto?"'s dot fades in too: under it the dot is grey.) */
  .lit {
    --k: 1;
    pointer-events: none;
  }
  .lit .dot {
    transform: scale(calc(1 + 0.8 * var(--k)));
  }
  .guess .dot {
    opacity: var(--k);
  }
  .guess .dot circle {
    fill: #fff;
  }
  .lit .name {
    opacity: var(--k);
    transform: translateY(calc(var(--r) * -0.8px * var(--k))) scale(calc(1 + 0.45 * var(--k)));
  }
  .name {
    fill: #fff;
    font-family: var(--font);
    font-size: 1.2px;
    font-weight: 600;
    text-anchor: middle;
    /* a navy halo, so it reads over the dots */
    paint-order: stroke;
    stroke: var(--navy);
    stroke-width: 0.5;
    stroke-linejoin: round;
    transform-box: fill-box;
    transform-origin: center bottom;
  }
  .home .name {
    font-weight: 700;
  }
  /* Kalisz calls out: a ring of its orange, spreading and fading */
  .pulse {
    fill: none;
    stroke: var(--orange-bright);
    stroke-width: 0.12;
    transform-box: fill-box;
    transform-origin: center;
    animation: pulse 2.6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }
  @keyframes pulse {
    from {
      transform: scale(1);
      opacity: 0.9;
    }
    to {
      transform: scale(3.2);
      opacity: 0;
    }
  }
  .map.away .pulse {
    animation-play-state: paused;
  }
  @media (prefers-reduced-motion: reduce) {
    .pulse {
      animation: none;
      transform: scale(1.9);
      opacity: 0.5;
    }
  }

  /* The most visited places, Kalisz first, each after its dot as on the map (sized and coloured as there): the list
     keys the map. Pointed at, the place goes white and bolder (Kalisz, bold already, orange) and its dot on the map
     grows and is named; "i wiele innych" grows the rest. */
  .headquarters__cities {
    grid-area: cities;
  }
  .cities {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2) var(--sp-5);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .city {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    color: #cfdcee;
    font-size: var(--fs-sm);
    transition: color var(--dur) var(--ease-hover);
  }
  .city::before {
    content: '';
    flex: none;
    width: calc(0.45rem + var(--t, 0) * 0.3rem);
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: var(--colour);
  }
  .city.on {
    color: #fff;
    font-weight: 600;
  }
  /* as wide as it is bold, so going bold moves nothing: its bold copy, unseen and flat, under it */
  .city__name {
    display: inline-flex;
    flex-direction: column;
  }
  .city__name::after {
    content: attr(data-name);
    height: 0;
    overflow: hidden;
    font-weight: 700;
    visibility: hidden;
    pointer-events: none;
  }
  .city--home {
    color: #fff;
    font-weight: 700;
  }
  .city--home::before {
    width: 0.8rem;
    border: 2px solid #fff;
    background: radial-gradient(circle closest-side, #fff 0 45%, var(--orange-bright) 49%);
  }
  .city--home.on {
    color: var(--orange-bright);
  }
  /* three pale orange dots, growing */
  .city--more::before {
    width: 0.85rem;
    aspect-ratio: auto;
    height: 0.4rem;
    border-radius: 0;
    background:
      radial-gradient(circle at 0.12rem 50%, var(--cold) 0.12rem, transparent 0.13rem),
      radial-gradient(circle at 0.4rem 50%, var(--cold) 0.15rem, transparent 0.16rem),
      radial-gradient(circle at 0.68rem 50%, var(--cold) 0.18rem, transparent 0.19rem);
  }
  /* a ring, filled as its place lights up; the button only its words */
  .city--guess::before {
    width: 0.55rem;
    box-shadow: inset 0 0 0 1.5px var(--cold);
    background-color: transparent;
    transition: background-color var(--dur) var(--ease-hover);
  }
  .city--guess.on::before {
    background-color: var(--hot);
    box-shadow: none;
  }
  .city--guess button {
    cursor: pointer;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
  }
  .city--guess button:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
    border-radius: 0.2rem;
  }
  .headquarters__act {
    grid-area: act;
    margin-top: var(--sp-4);
  }

  @media (min-width: 56.25rem) {
    .headquarters__inner {
      /* the text centred against the map, its rows taking no more room than they need; the map a share of the row
         (not all it could take before the text gets any) */
      grid-template-columns: minmax(0, 1fr) clamp(20rem, 45%, 32rem);
      grid-template-rows: 1fr auto auto auto auto 1fr;
      grid-template-areas:
        '. map'
        'title map'
        'lede map'
        'cities map'
        'act map'
        '. map';
      column-gap: var(--sp-10);
      row-gap: var(--sp-4);
      padding-block: var(--sp-12);
    }
    .headquarters__map {
      align-self: center;
      margin: 0;
    }
    .map {
      max-width: none;
    }
    .headquarters__cities {
      margin-top: var(--sp-2);
    }
    .headquarters__act {
      margin-top: var(--sp-3);
    }
  }
</style>
