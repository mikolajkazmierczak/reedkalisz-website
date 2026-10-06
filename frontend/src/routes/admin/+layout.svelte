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
  import Mat from '@c/Mat.svelte';
  import { onGrid } from '@/onGrid';
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
  // what was saved while the connection was lost went unheard: the shared data read again (the pages showing it follow,
  // see overwrite.js)
  heimdall.reconnected(() => globals.refreshAll());
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <style>
    body {
      background-color: var(--board);
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
  <div class="content" use:onGrid>
    <Mat />
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

  /* The page on the cutting mat (see Mat), beside the menu: its slots from the mat's frame, the first right under the
     header; as wide and, at least, as tall as the window, rounded down to whole half cells - what's left over goes past
     the mat's right and bottom frame (--leftover, --fill-height), so what lies on the mat reaches its frame */
  .content {
    --mat-inset: 0 var(--leftover) 0 var(--nav-width);
    position: relative;
    min-height: calc(var(--header-height) + var(--fill-height) + var(--mat-margin) + 1px);
    padding: var(--header-height) calc(var(--mat-margin) + 1px + var(--leftover)) calc(var(--mat-margin) + 1px)
      calc(var(--nav-width) + var(--mat-margin));
  }
  /* a phone: no menu beside it (it's over the page when opened, see Nav), the leftover on both sides (--lead), room
     under it for the menu's button */
  @media (max-width: 50rem) {
    .content {
      --mat-inset: 0 calc(var(--leftover) - var(--lead)) 0 var(--lead);
      padding: var(--header-height) calc(var(--mat-margin) + 1px + var(--leftover) - var(--lead)) 5rem
        calc(var(--mat-margin) + var(--lead));
    }
    .content :global(.ui-fill) {
      height: auto;
    }
  }
</style>
