<script>
  import { slide } from 'svelte/transition';
  import { page } from '$app/stores';
  import { baseUrl } from '$/api';
  import { me, logout } from '$/auth';
  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import HoverCircle from '$c/HoverCircle.svelte';

  function getEditUrl(pathname) {
    // TODO: add support for pages and fragments
    if (pathname.startsWith('/produkty/')) {
      return '/admin/produkty/' + pathname.split('/')[2];
    } else if (pathname.startsWith('/kategorie/')) {
      return '/admin/kategorie/' + pathname.split('/')[2];
    } else {
      return null;
    }
  }

  $: editUrl = getEditUrl($page.url.pathname);
</script>

<div class="admin">
  {#if editUrl}
    <a
      data-sveltekit-prefetch
      href={editUrl}
      rel="noreferrer"
      target="_blank"
      class="tile"
      transition:slide={{ duration: 200 }}
    >
      <HoverCircle color="var(--main-2)" />
      <Tooltip label="Edytuj" />
      <div class="icon"><Icon name="edit_settings" /></div>
    </a>
  {/if}
  <a data-sveltekit-prefetch href="/admin" rel="noreferrer" target="_blank" class="tile">
    <HoverCircle color="var(--main-2)" />
    <Tooltip label="Panel admina" />
    <div class="icon"><Icon name="slide_settings" /></div>
  </a>
  <button class="tile logout" on:click={logout}>
    <HoverCircle color="var(--main-2)" />
    <Tooltip label="Wyloguj" />
    <div class="icon"><Icon name="logout" /></div>
  </button>
  <div class="tile avatar">
    <Tooltip label="{$me.first_name} {$me.last_name}" />
    <img src="{baseUrl}/assets/{$me.avatar}" alt="avatar" />
  </div>
</div>

<style>
  .admin {
    z-index: 1;
    position: fixed;
    bottom: 10px;
    left: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    border-radius: 100px;
    padding: 5px;
    background-color: var(--main-1);
  }

  .tile {
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 100px;
    border: none;
    padding: 5px;
    width: 40px;
    height: 40px;
    background-color: var(--main-1);
  }
  .avatar {
    cursor: help;
    padding: 0;
  }

  .icon {
    z-index: 1;
    width: 25px;
    height: 25px;
  }
  img {
    z-index: 1;
    border-radius: 100px;
    width: 100%;
  }
</style>
