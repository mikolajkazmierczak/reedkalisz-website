<script>
  import { page } from '$app/stores';
  import { baseUrl } from '$lib/api';
  import { auth, me, logout } from '$lib/auth';
  import { fly } from 'svelte/transition';
  import { spring } from 'svelte/motion';
  import HoverCircle from '$lib/components/HoverCircle.svelte';
  import User from '$lib/admin/nav/User.svelte';
  import Notifications from '$lib/admin/nav/Notifications.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import Icon from '$lib/common/Icon.svelte';

  const buttons = [
    { href: '/', icon: 'dashboard', name: 'Aktywność' },
    { href: '/produkty', icon: 'products', name: 'Produkty' },
    { href: '/kategorie', icon: 'categories', name: 'Kategorie' },
    { href: '/kalkulator', icon: 'calculator', name: 'Kalkulatory' },
    { href: '/kolory', icon: 'colors', name: 'Kolory' },
    { href: '/menu', icon: 'menu', name: 'Menu' },
    { href: '/strony', icon: 'pages', name: 'Strony' },
    { href: '/fragmenty', icon: 'fragments', name: 'Fragmenty' },
    { href: '/zapytania', icon: 'questions', name: 'Zapytania' },
    { href: '/biblioteka', icon: 'library', name: 'Biblioteka' },
    { href: '/api', icon: 'api', name: 'API' }
  ];

  $: path = $page.url.pathname.replace('/admin', '/').replace('//', '/');

  let showNotifications = false;
  let showUser = false;

  function toggleNotifications() {
    showUser = false;
    showNotifications = !showNotifications;
    $auth = false;
  }

  function toggleUserCard() {
    showNotifications = false;
    showUser = !showUser;
  }

  let awaitingLogout = false;
  async function handleLogout() {
    awaitingLogout = true;
    await logout();
    awaitingLogout = false;
  }

  let mouse = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.5 });
</script>

<nav transition:fly={{ x: -20, duration: 600 }}>
  <div class="wrapper">
    <a data-sveltekit-prefetch class="button tile logo" href="/" rel="external">
      <img src="/logo.svg" alt="logo" />
    </a>
    {#each buttons as { href, icon, name }}
      <a
        data-sveltekit-prefetch
        class="button"
        href={'/admin' + href}
        class:current={path == href}
        on:mousemove={e => ($mouse = { x: e.clientX + 25, y: e.clientY })}
      >
        <HoverCircle color={'var(--primary-dark)'} show={path == href} />
        <div class="tooltip" style="top:{$mouse.y}px; left:{$mouse.x}px;">{name}</div>
        <div class="icon">
          <Icon name={icon} light />
        </div>
      </a>
    {/each}
  </div>
  <div class="wrapper">
    <button class="button" on:click={toggleNotifications}>
      <Icon name="notifications" light />
    </button>
    <button class="button" on:click={handleLogout}>
      {#if awaitingLogout}
        <Loader />
      {:else}
        <Icon name="logout" light />
      {/if}
    </button>
    <button class="button tile avatar" on:click={toggleUserCard}>
      <img src={baseUrl + '/assets/' + $me.avatar} alt="" />
    </button>
  </div>
</nav>

<User show={showUser} />

<Notifications show={showNotifications} />

<style>
  nav {
    --gap: 0.75rem;
    --width: 4rem;
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    width: var(--width);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: var(--primary);
  }

  .wrapper {
    display: grid;
    row-gap: var(--gap);
    padding: 0.9rem;
    width: 100%;
  }
  .button {
    cursor: pointer;
    overflow: hidden;
    position: relative;
    justify-self: center;
    display: grid;
    place-items: center;
    aspect-ratio: 1 / 1;
    outline: none;
    border: none;
    padding: 0.3rem;
    width: 100%;
    font: inherit;
    color: inherit;
    background-color: rgba(0, 0, 0, 0);
  }
  .button img {
    z-index: 1;
    position: relative;
    object-fit: cover;
    width: 100%;
  }
  .button .icon {
    z-index: 1;
    display: grid;
    place-items: center;
  }
  .tooltip {
    pointer-events: none;
    z-index: 1000;
    position: fixed;
    border: var(--border);
    padding: 0.25rem 0.5rem;
    background-color: var(--light);
    transform: scale(0);
    transform-origin: top left;
    transition: transform 200ms;
  }
  .button:hover .tooltip {
    transform: scale(1);
  }

  .tile {
    padding: 0;
  }
  .logo {
    background-color: var(--main);
  }
  .avatar {
    border-radius: 50%;
  }
  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
