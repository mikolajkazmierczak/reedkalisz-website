<script>
  import { beforeNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  import heimdall from '$/heimdall';
  import { me, readme } from '$/auth';
  import { errors, unsaved } from '@/stores';
  import { updateGlobal, globals } from '@/globals';

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

  $: if ($me) updateGlobal(globals.users);

  heimdall.listen(async ({ data }) => {
    const { collection, ids, refresh } = data;
    const options = { ids, refresh };
    if (collection == 'directus_users') await updateGlobal(globals.users, options);
    else if (collection == 'companies') await updateGlobal(globals.companies, options);
    else if (collection == 'labelings') await updateGlobal(globals.labelings, options);
    else if (collection == 'price_views') await updateGlobal(globals.priceViews, options);
    else if (collection == 'global_margins') await updateGlobal(globals.globalMargins, options);
    else if (collection == 'categories') await updateGlobal(globals.categories, options);
    else if (collection == 'colors') await updateGlobal(globals.colors, options);
  }, true);
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
