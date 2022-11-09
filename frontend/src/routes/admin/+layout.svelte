<script>
  import { beforeNavigate } from '$app/navigation';
  import { onDestroy, onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  import socket from '$lib/admin/heimdall';
  import { me, readme } from '$lib/auth';
  import { errors, edited } from '$lib/admin/stores';
  import {
    updateGlobal,
    users,
    companies,
    labelings,
    priceViews,
    globalMargins,
    categories,
    colors
  } from '$lib/admin/global';

  import Error from '$lib/admin/Error.svelte';
  import Login from '$lib/admin/Login.svelte';
  import Nav from '$lib/admin/nav/Nav.svelte';
  import Header from '$lib/admin/Header.svelte';
  import Loader from '$lib/components/Loader.svelte';

  beforeNavigate(navigation => {
    if ($edited) {
      if (confirm('Zmiany nie zostały zapisane. Czy na pewno chcesz opuścić stronę?')) {
        $edited = false;
      } else {
        navigation.cancel();
      }
    }
  });

  $: if ($me) updateGlobal(users);

  let ready = false;
  onMount(async () => {
    await readme();
    ready = true;
    // catch all errors
    window.addEventListener('error', e => ($errors = [...$errors, e?.reason?.message]));
    window.addEventListener('unhandledrejection', e => ($errors = [...$errors, e?.reason?.message]));
  });

  async function listener(data) {
    if (data.collection == 'directus_users') await updateGlobal(users);
    else if (data.collection == 'companies') await updateGlobal(companies);
    else if (data.collection == 'labelings') await updateGlobal(labelings);
    else if (data.collection == 'price_views') await updateGlobal(priceViews);
    else if (data.collection == 'global_margins') await updateGlobal(globalMargins);
    else if (data.collection == 'categories') await updateGlobal(categories);
    else if (data.collection == 'colors') await updateGlobal(colors);
  }
  socket.onChanges(listener);
  onDestroy(() => {
    socket.offChanges(listener);
    socket.close();
  });
</script>

<svelte:head>
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
    padding: 5.5rem 1.5rem 1.5rem 5.5rem;
  }
</style>
