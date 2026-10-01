<script>
  import '$/styles/ui-admin.css';

  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  import heimdall from '$/heimdall';
  import { me, readme } from '$/auth';

  import globals from '@/globals';
  import { errors, unsaved } from '@/stores';
  import { guardLeaving } from '@/dialog';

  import Dialog from '@/Dialog.svelte';
  import Error from '@/Error.svelte';
  import Login from '@/Login.svelte';
  import Nav from '@/nav/Nav.svelte';
  import Header from '@/Header.svelte';
  import Loader from '$c/Loader.svelte';

  // an editor with unsaved changes
  guardLeaving(() => $unsaved, { discard: () => ($unsaved = false) });

  let ready = false;
  onMount(async () => {
    await readme();
    ready = true;
    // catch all errors
    window.addEventListener('error', (e) => {
      // the browser's harmless note that a ResizeObserver had more to report in one frame
      if (e.message?.startsWith('ResizeObserver loop')) return;
      $errors = [...$errors, e.error?.message ?? e.message];
    });
    window.addEventListener('unhandledrejection', (e) => ($errors = [...$errors, e?.reason?.message]));
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
      background-color: var(--grey-100);
      background-image: url('/imgs/dot_grid.png');
      background-size: 10rem;
    }
  </style>
</svelte:head>

<Error />
<Dialog />

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
    /* the header is fixed above it (4rem), the first box right under it (the menu's first button starts there too,
       see Nav) */
    padding: var(--header-height) 1.5rem 1.5rem calc(var(--nav-width) + 1.5rem);
  }
  /* a phone: no menu beside it (it's over the page when opened, see Nav), room under it for the menu's button */
  @media (max-width: 50rem) {
    .content {
      padding: var(--header-height) 0.75rem 5rem;
    }
    .content :global(.ui-fill) {
      height: auto;
    }
  }
</style>
