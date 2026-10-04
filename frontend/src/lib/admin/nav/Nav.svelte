<script>
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';

  import api, { baseUrl } from '$/api';
  import heimdall from '$/heimdall';
  import { me, logout } from '$/auth';
  import Tooltip from '$c/Tooltip.svelte';
  import { plural } from '@/plural';
  import NavButton from './NavButton.svelte';
  import { goto } from '$app/navigation';
  import Icon from '$c/Icon.svelte';
  import Changelog, { compare, date, readSeen } from '../changelog/Changelog.svelte';
  import { changelog as versions, version } from '../changelog/changelog.js';

  // the menu, in groups (spaced apart); `section`: the pages under it light the button up too
  const buttons = [
    [
      { href: '/produkty', icon: 'products', name: 'Produkty' },
      { href: '/kalkulacje/znakowania', icon: 'calculator', name: 'Kalkulacje', section: '/kalkulacje' },
      { href: '/api/produkty', icon: 'api', name: 'API', section: '/api' },
    ],
    [
      { href: '/kategorie', icon: 'categories', name: 'Kategorie' },
      { href: '/strony', icon: 'pages', name: 'Strony' },
      { href: '/fragmenty', icon: 'fragments', name: 'Fragmenty' },
    ],
    [
      { href: '/kolory', icon: 'colors', name: 'Kolory' },
      { href: '/paragrafy', icon: 'commercial_details', name: 'Paragrafy' },
      { href: '/biblioteka', icon: 'library', name: 'Biblioteka' },
    ],
    [{ href: '/zapytania', icon: 'questions', name: 'Zapytania' }],
  ];

  $: path = $page.url.pathname.replace('/admin', '/').replace('//', '/');

  // Something to look at: questions nobody has opened yet, plain colours without their hex. The button is outlined in
  // orange while there are any, its tooltip says how many.
  // a count that fails (a field not there yet) leaves the button as it is, it doesn't break the menu
  async function count(collection, filter) {
    try {
      const options = { fields: ['id'], filter, limit: 0, meta: 'filter_count' };
      return (await api.items(collection).readByQuery(options)).meta.filter_count;
    } catch {
      return 0;
    }
  }
  let unread = 0;
  let colorless = 0;
  const countUnread = async () => (unread = await count('questions', { read: { _eq: false } }));
  const countColorless = async () =>
    (colorless = await count('colors', {
      _and: [
        { _or: [{ color: { _null: true } }, { color: { _empty: true } }] }, // (9.22's _empty is only '')
        { multicolor: { _neq: true } },
        { transparent: { _neq: true } },
        { wood: { _neq: true } },
        { neutral: { _neq: true } },
      ],
    }));
  // again on every page: a question sent from the website doesn't come through heimdall
  $: if ($me && path) countUnread();
  $: if ($me && path) countColorless();
  heimdall.listen(({ match }) => {
    if (!$me) return;
    if (match('questions')) countUnread();
    if (match('colors')) countColorless();
  });

  $: warnings = {
    '/zapytania': unread
      ? plural(unread, 'nieprzeczytane zapytanie', 'nieprzeczytane zapytania', 'nieprzeczytanych zapytań')
      : null,
    '/kolory': colorless ? plural(colorless, 'kolor', 'kolory', 'kolorów') + ' bez wartości' : null,
  };

  // the changelog: from the version under the name, and by itself once after a new version (see Changelog); a
  // browser without one seen yet counts as having seen the last one from over a week ago - the week's are new to it
  let changelog = false;
  let seen = null;
  $: if ($me) openIfNew();
  const lastSeen = () => readSeen() ?? versions.find((v) => v.date < daysAgo(7))?.version ?? null;
  const daysAgo = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString('sv'); // (as YYYY-MM-DD, here)
  function openIfNew() {
    seen = lastSeen();
    if (compare(version, seen) > 0) changelog = true;
  }

  // On a phone the menu is off the screen, a button in the bottom left corner brings it over the page (under an
  // editor and the popups: they have their own ways back). Going somewhere, or tapping beside it, puts it away.
  let open = false;
  $: (path, (open = false));
  const phone = typeof window !== 'undefined' && window.matchMedia('(max-width: 50rem)').matches; // (no fly in: it's away)

  // the menu is as wide as its widest button (or the name): the header and the page start where it ends
  function width(node) {
    const set = () => document.documentElement.style.setProperty('--nav-width', node.offsetWidth + 'px');
    const observer = new ResizeObserver(set);
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }
</script>

{#if $me}
  <button class="opener" aria-label="Menu" aria-expanded={open} on:click={() => (open = true)}>
    <Icon fill name="menu" light />
  </button>
  {#if open}
    <div class="beside" role="presentation" on:click={() => (open = false)} transition:fade={{ duration: 150 }} />
  {/if}
  <nav class:open in:fly={{ x: -20, duration: phone ? 0 : 600 }} use:width>
    <!-- as tall as the header, so the logo is level with the page's title -->
    <a href="/" rel="external" class="logo">
      <img src="/logo.svg" alt="REED" />
    </a>
    <div class="groups">
      {#each buttons as group}
        <div class="group">
          {#each group as { href, icon, name, section = href }}
            <!-- lit on the page and everything under it (the product editor, the API tabs) -->
            <NavButton
              {icon}
              label={name}
              warn={!!warnings[href]}
              on:click={() => (goto('/admin' + href), (open = false))}
              tick={path == section || path.startsWith(section + '/')}>
              {#if warnings[href]}<Tooltip><small>{warnings[href]}</small></Tooltip>{/if}
            </NavButton>
          {/each}
        </div>
      {/each}
    </div>
    <div class="group bottom">
      <NavButton label="Wyloguj" icon="logout" center on:click={logout} />
      <div class="me">
        <img class="avatar" src="{baseUrl}/assets/{$me.avatar}" alt="" />
        <span class="name">
          <span>{$me.first_name ?? ''}</span>
          <span>{$me.last_name ?? ''}</span>
        </span>
      </div>
      <button class="version" on:click={() => ((seen = lastSeen()), (changelog = true))}>
        v{version} · {date(versions[0].date)}
      </button>
    </div>
  </nav>
  {#if changelog}<Changelog {seen} on:close={() => (changelog = false)} />{/if}
{/if}

<svelte:window on:keydown={(e) => open && e.key === 'Escape' && (open = false)} />

<style>
  nav {
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    width: max-content;
    height: 100%;
    display: flex;
    flex-direction: column;
    --nav-skew: 0.25rem; /* a little more padding on the right: the icons on the left look centred */
    --nav-end: calc(0.5rem + var(--nav-skew)); /* its right padding: the page you're on reaches over it (NavButton) */
    padding: 0 var(--nav-end) 0.75rem 0.5rem;
    /* a short window: it scrolls (no bar: it would widen the menu, see width) */
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
    background-color: var(--rail);
    --nav-button-pad: 0.7rem; /* see NavButton */
  }
  /* the stub's edge: a line of perforation holes, the board showing through them, where it tears off the page - fixed
     at the menu's right edge (see width), so they stay put down its whole height while a short window's menu scrolls */
  nav::after {
    content: '';
    pointer-events: none;
    position: fixed;
    top: 0;
    left: calc(var(--nav-width) - 0.2rem - 0.25rem); /* (0.2rem in from it) */
    bottom: 0;
    width: 0.25rem;
    background: radial-gradient(circle, var(--board) 0.07rem, transparent 0.09rem) center top / 0.25rem 0.5rem repeat-y;
    opacity: 0.55;
  }
  /* as tall as the header, the logo level with its buttons (see Header); it starts where the menu buttons' icons do
     (their padding) */
  .logo {
    display: flex;
    align-items: center;
    flex: none;
    height: var(--header-height);
    padding: var(--mat-margin) var(--nav-button-pad) 1px; /* (on whole pixels, as the header's buttons) */
  }
  .logo img {
    height: var(--bar-button); /* as tall as the header's buttons */
  }
  /* on the mat's half lines as the page is: the buttons a cell and a half tall, one under another (see NavButton), the
     groups half a cell apart - a group of three four and a half cells, five with the gap after it */
  .groups {
    display: flex;
    flex-direction: column;
    gap: var(--half);
  }
  .group {
    display: flex;
    flex-direction: column;
  }
  /* the groups ruled apart, as a form's sections, the rule halfway down the gap */
  .groups > .group + .group {
    position: relative;
  }
  .groups > .group + .group::before {
    content: '';
    position: absolute;
    top: calc(var(--half) / -2);
    left: var(--nav-button-pad);
    right: var(--nav-button-pad);
    height: 1px;
    background-color: var(--rail-line);
  }
  /* Wyloguj and the name under it on one grid, in the menu's middle (its padding evened out by the skew): the logout's
     icon and the avatar on one axis, the word and the name starting on another (see NavButton's center) */
  .bottom {
    margin-top: auto;
    display: grid;
    grid-template-columns: 1fr auto auto 1fr;
    column-gap: 0;
    padding-left: var(--nav-skew);
    --nav-name-gap: 0.55rem;
    --version: 1.125rem; /* the version's line */
  }
  /* in a darker band, flush with the menu's sides (over its padding), the version under it - the band taking up what
     the window's height leaves over the half cells, so Wyloguj above it starts on a half line of the mat too (the
     group from it to the menu's bottom four and a half cells and that: Wyloguj's cell and a half, the gap, the band,
     the version) */
  .me {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: center;
    align-content: center;
    margin: var(--quarter) -0.75rem 0;
    height: calc(3 * var(--cell) - var(--quarter) - var(--version) + mod(100dvh, var(--half)));
    background-color: rgb(0 0 0 / 0.2);
  }
  /* a window too short for it all (under 658px): the band half a cell lower - Wyloguj still on a half line */
  @media (max-height: 41.0625rem) {
    .me {
      height: calc(2.5 * var(--cell) - var(--quarter) - var(--version) + mod(100dvh, var(--half)));
    }
  }
  /* under the name, darker still, the faint version and its date in the menu's middle: it opens the changelog - in
     red, as a form's serial number */
  .version {
    grid-column: 1 / -1;
    margin: 0 -0.75rem -0.75rem; /* (over the menu's sides and bottom padding) */
    padding: 0 0.5rem;
    height: var(--version);
    line-height: var(--version);
    border: none;
    cursor: pointer;
    text-align: center;
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    color: rgb(243 140 151 / 0.55);
    background-color: rgb(0 0 0 / 0.32);
    transition: color 150ms;
  }
  .version:hover,
  .version:focus-visible {
    color: rgb(243 140 151 / 1);
  }
  /* beside the name's two lines, in their middle */
  .avatar {
    grid-column: 2;
    justify-self: center;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    object-fit: cover;
  }
  /* the name above the surname */
  .name {
    grid-column: 3;
    margin-left: var(--nav-name-gap);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-size: 0.75rem; /* small: a long surname shouldn't widen the menu much */
    font-weight: 700;
    line-height: 1.2;
  }
  .name > span {
    color: var(--light); /* on the spans: the admin's spans have a dark colour of their own */
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* the phone's: a squircle over the page's corner (over the header, under an editor: 100, and the popups) */
  .opener,
  .beside {
    display: none;
  }
  @media (max-width: 50rem) {
    .opener {
      z-index: 50;
      position: fixed;
      left: 0.75rem;
      bottom: 0.75rem;
      display: grid;
      place-items: center;
      width: 3.25rem;
      height: 3.25rem;
      padding: 0.85rem;
      cursor: pointer;
      border: none;
      border-radius: var(--box-radius);
      corner-shape: squircle;
      background-color: var(--rail);
      box-shadow: var(--shadow-lifted);
    }
    .opener:active {
      background-color: var(--navy-900);
    }
    .beside {
      z-index: 60;
      position: fixed;
      inset: 0;
      display: block;
      background-color: var(--black-50);
    }
    /* off the screen, until opened (still measured: the page doesn't start after it, see the admin layout); hidden
       once it's slid away, so its buttons aren't tabbed to or read out */
    nav {
      height: 100dvh;
      z-index: 61;
      transform: translateX(-100%);
      visibility: hidden;
      transition:
        transform 200ms ease-out,
        visibility 0s 200ms;
    }
    /* stays at the top while the menu scrolls, over the buttons going under it (across the menu's padding) */
    .logo {
      z-index: 2; /* (over the page you're on too, see NavButton) */
      position: sticky;
      top: 0;
      margin: 0 -0.75rem 0 -0.5rem;
      height: 4rem; /* (its own: the phone's header is lower) */
      padding: 0.9rem calc(var(--nav-button-pad) + 0.75rem) 0.9rem calc(var(--nav-button-pad) + 0.5rem);
      background-color: var(--rail);
    }
    .logo img {
      height: 100%;
    }
    nav.open {
      transform: none;
      visibility: visible;
      transition-delay: 0s;
      box-shadow: 0 0 2rem rgb(0 0 0 / 0.3);
    }
  }
</style>
