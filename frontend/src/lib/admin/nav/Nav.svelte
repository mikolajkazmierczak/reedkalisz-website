<script>
  import { page } from '$app/stores';
  import { baseUrl } from '$lib/api';
  import { auth, me, logout } from '$lib/auth';
  import { fly } from 'svelte/transition';
  import User from '$lib/admin/nav/User.svelte';
  import Notifications from '$lib/admin/nav/Notifications.svelte';
  import Loader from '$lib/components/Loader.svelte';

  const buttons = [
    { href: '/', icon: 'dashboard.svg', name: 'Aktywność' },
    { href: '/produkty', icon: 'product.svg', name: 'Produkty' },
    { href: '/kategorie', icon: 'category.svg', name: 'Kategorie' },
    { href: '/kalkulator', icon: 'calculator.svg', name: 'Kalkulatory' },
    { href: '/kolory', icon: 'color.svg', name: 'Kolory' },
    { href: '/menu', icon: 'menu.svg', name: 'Menu' },
    { href: '/strony', icon: 'page.svg', name: 'Strony' },
    { href: '/fragmenty', icon: 'fragment.svg', name: 'Fragmenty' },
    { href: '/zapytania', icon: 'question.svg', name: 'Zapytania' },
    { href: '/api', icon: 'api.svg', name: 'API' }
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
</script>

<nav transition:fly={{ x: -20, duration: 600 }}>
  <div class="wrapper">
    <a sveltekit:prefetch class="button tile logo" href="/" rel="external">
      <img src="/logo.svg" alt="logo" />
    </a>
    {#each buttons as { href, icon, name }}
      <a sveltekit:prefetch class="button" href={'/admin' + href} class:current={path == href}>
        <img src={'/icon/' + icon} alt={name} />
      </a>
    {/each}
  </div>
  <div class="wrapper">
    <button class="button" on:click={toggleNotifications}>
      <img src="/icon/notification.svg" alt="Powiadomienia" />
    </button>
    <button class="button" on:click={handleLogout}>
      {#if awaitingLogout}
        <Loader dark={true} />
      {:else}
        <img src="/icon/logout.svg" alt="Wyloguj" />
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
    border: var(--border);
    background-color: var(--light);
  }

  .wrapper {
    display: grid;
    row-gap: var(--gap);
    padding: var(--gap) 0.75rem;
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
  .button::before {
    content: '';
    z-index: -1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0%;
    height: 0%;
    border-radius: 50%;
    background-color: var(--teriary);
    transition: width 200ms, height 200ms;
  }
  .button:hover::before,
  .button.current::before {
    width: 200%;
    height: 200%;
  }
  .button img {
    object-fit: cover;
    width: 100%;
  }

  .tile {
    padding: 0;
  }
  .logo {
    background-color: var(--main);
  }
  .avatar {
    outline: var(--border);
  }
</style>
