<script>
  import { page } from '$app/stores';
  import { fly } from 'svelte/transition';

  import { baseUrl } from '$/api';
  import { me, logout } from '$/auth';
  import Icon from '$c/Icon.svelte';
  import Loader from '$c/Loader.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import Notifications from '@/nav/Notifications.svelte';
  import NavButton from './NavButton.svelte';
  import { goto } from '$app/navigation';

  const buttons = [
    [{ href: '/', icon: 'dashboard', name: 'Dashboard' }],
    [
      { href: '/produkty', icon: 'products', name: 'Produkty' },
      { href: '/kolory', icon: 'colors', name: 'Kolory' },
      { href: '/kategorie', icon: 'categories', name: 'Kategorie' },
      { href: '/informacje-handlowe', icon: 'commercial_details', name: 'Informacje handlowe' },
      { href: '/kalkulacje', icon: 'calculator', name: 'Kalkulacje' }
    ],
    [
      { href: '/menu', icon: 'menu', name: 'Menu' },
      { href: '/strony', icon: 'pages', name: 'Strony' },
      { href: '/fragmenty', icon: 'fragments', name: 'Fragmenty' }
    ],
    [
      { href: '/biblioteka', icon: 'library', name: 'Biblioteka' },
      { href: '/zapytania', icon: 'questions', name: 'Zapytania' },
      { href: '/api', icon: 'api', name: 'API' }
    ]
  ];

  $: path = $page.url.pathname.replace('/admin', '/').replace('//', '/');

  let showNotifications = false;
  function toggleNotifications() {
    showNotifications = !showNotifications;
  }

  let awaitingLogout = false;
  async function handleLogout() {
    awaitingLogout = true;
    logout();
    awaitingLogout = false;
  }
</script>

{#if $me}
  <nav in:fly={{ x: -20, duration: 600 }}>
    <div class="buttons">
      <a href="/" rel="external" class="logo">
        <img src="/logo.svg" alt="logo" />
      </a>
      {#each buttons as group, i}
        {#if i > 0}<div class="blank" />{/if}
        {#each group as { href, icon, name }}
          <NavButton {icon} label={name} on:click={() => goto('/admin' + href)} tick={href == path} />
        {/each}
      {/each}
    </div>
    <div class="buttons">
      <NavButton round icon="notifications" label="Notyfikacje" on:click={toggleNotifications} />
      <NavButton round label="Wyloguj" on:click={handleLogout}>
        {#if awaitingLogout}
          <Loader />
        {:else}
          <Icon fill name="logout" light />
        {/if}
      </NavButton>
      <div class="avatar">
        <Tooltip>{$me.first_name} {$me.last_name}</Tooltip>
        <img src="{baseUrl}/assets/{$me.avatar}" alt="" />
      </div>
    </div>
  </nav>
{/if}

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
  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap);
    padding: 0.9rem;
    width: 100%;
  }
  .blank {
    width: 50%;
    height: 2px;
    background-color: var(--primary-dark);
  }

  .logo,
  .avatar {
    overflow: hidden;
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 1 / 1;
  }
  .logo {
    background-color: var(--main);
  }
  .avatar {
    cursor: help;
    border-radius: 50%;
  }
  img {
    width: 100%;
    object-fit: cover;
  }
</style>
