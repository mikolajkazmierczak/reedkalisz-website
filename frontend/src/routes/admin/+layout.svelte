<script>
  import '$/styles/ui-admin.css';

  import { beforeNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  import heimdall from '$/heimdall';
  import { me, readme } from '$/auth';

  import globals from '@/globals';
  import { errors, unsaved } from '@/stores';

  import Error from '@/Error.svelte';
  import Login from '@/Login.svelte';
  import Nav from '@/nav/Nav.svelte';
  import Header from '@/Header.svelte';
  import Loader from '$c/Loader.svelte';

  beforeNavigate(navigation => {
    if ($unsaved) {
      if (confirm('Zmiany nie zostały zapisane. Czy na pewno chcesz opuścić stronę?')) {
        $unsaved = false;
      } else navigation.cancel();
    }
  });

  let ready = false;
  onMount(async () => {
    await readme();
    ready = true;
    // catch all errors
    window.addEventListener('error', e => ($errors = [...$errors, e?.reason?.message]));
    window.addEventListener('unhandledrejection', e => ($errors = [...$errors, e?.reason?.message]));
  });

  $: if ($me) globals.update('directus_users');

  heimdall.listen(async ({ data }) => {
    const { collection, ids, refresh } = data;
    if (globals.collections.includes(collection)) {
      await globals.update(collection, { ids, refresh });
    }
  }, true);
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <style>
    body {
      background-color: var(--accent-white);
      background-image: url('/imgs/dot_grid.png');
      background-size: 160px;
    }
  </style>
</svelte:head>

<Error />

{#if ready}
  <Login />
{:else}
  <div class="loader" transition:fade={{ duration: 200 }}>
    <Loader dark />
  </div>
{/if}

{#if $me}
  <Nav />
  <Header />
  <div class="content">
    <slot />
  </div>
{/if}

<style>
  .loader {
    position: fixed;
    top: 0;
    left: 0;
    display: grid;
    place-items: center;
    width: 100%;
    height: 100vh;
  }

  .content {
    padding: 1.5rem 1.5rem 1.5rem 5.5rem;
  }
</style>
