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
      <NavButton label="Wyloguj" icon="logout" on:click={logout} />
      <div class="me">
        <img class="avatar" src="{baseUrl}/assets/{$me.avatar}" alt="" />
        <span class="name">
          <span>{$me.first_name ?? ''}</span>
          <span>{$me.last_name ?? ''}</span>
        </span>
      </div>
    </div>
  </nav>
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
    padding: 0 0.75rem 0.75rem 0.5rem; /* a little more on the right: it looks centred */
    background-color: var(--navy-700);
    --nav-button-pad: 0.7rem; /* see NavButton */
  }
  /* the header's height (4rem) and its padding (0.9rem): the logo is as tall as the title's line; it starts where
     the buttons' icons do (their padding) */
  .logo {
    display: flex;
    align-items: center;
    flex: none;
    height: 4rem;
    padding: 0.9rem var(--nav-button-pad);
  }
  .logo img {
    height: 100%;
  }
  .groups {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-top: 1rem; /* where the page's first box starts (see the admin layout) */
  }
  .group {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .bottom {
    margin-top: auto;
  }
  /* in a band like the lit button's, flush with the menu's sides and bottom (over its padding); the avatar's middle
     under the buttons' icons' (1.6rem to their 1.3rem, see NavButton) */
  .me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.5rem -0.75rem -0.75rem -0.5rem;
    --pad: calc(0.5rem + var(--nav-button-pad) - (1.6rem - 1.3rem) / 2);
    padding: var(--pad) 0.5rem var(--pad) var(--pad); /* as much above and below as on the left */
    background-color: var(--navy-900);
  }
  /* beside the name's two lines, in their middle */
  .avatar {
    flex: none;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    object-fit: cover;
  }
  /* the name above the surname */
  .name {
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
      background-color: var(--navy-700);
      box-shadow: 0 0.25rem 1rem rgb(0 0 0 / 0.25);
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
    /* scrolled when the screen is shorter than it (a phone held sideways) */
    nav {
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior: contain;
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
      z-index: 1;
      position: sticky;
      top: 0;
      margin: 0 -0.75rem 0 -0.5rem;
      padding: 0.9rem calc(var(--nav-button-pad) + 0.75rem) 0.9rem calc(var(--nav-button-pad) + 0.5rem);
      background-color: var(--navy-700);
    }
    nav.open {
      transform: none;
      visibility: visible;
      transition-delay: 0s;
      box-shadow: 0 0 2rem rgb(0 0 0 / 0.3);
    }
  }
</style>
