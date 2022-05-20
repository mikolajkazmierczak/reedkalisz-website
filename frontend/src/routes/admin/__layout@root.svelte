<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  import { me, readme } from '$lib/auth';
  import Loader from '$lib/components/Loader.svelte';
  import Error from '$lib/admin/Error.svelte';
  import Login from '$lib/admin/Login.svelte';
  import Nav from '$lib/admin/nav/Nav.svelte';
  import Header from '$lib/admin/Header.svelte';

  let ready = false;
  onMount(async () => {
    await readme();
    ready = true;
  });
</script>

<div class="bg" />

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
  .bg,
  .loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-image: url('/img/dot_grid.png');
  }

  .bg {
    z-index: -1;
  }

  .loader {
    display: grid;
    place-items: center;
  }

  .content {
    z-index: 0;
    padding: 6.75rem 1.5rem 1.75rem 5.5rem;
    width: 100%;
  }
</style>
