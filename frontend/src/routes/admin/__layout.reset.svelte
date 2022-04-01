<script>
  import '$lib/global.css';

  import { me, readme } from '$lib/auth';

  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import Loader from '$lib/components/Loader.svelte';
  import Error from '$lib/admin/Error.svelte';
  import Login from '$lib/admin/Login.svelte';
  import Nav from '$lib/admin/nav/Nav.svelte';

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
    <Loader dark={true} />
  </div>
{/if}

{#if $me}
  <Nav />
  <slot />
{/if}

<style>
  .bg,
  .loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
  }

  .bg {
    z-index: -1;
    background-image: url('/img/dot_grid.png');
  }

  .loader {
    display: grid;
    place-items: center;
    background-image: url('/img/dot_grid.png');
  }
</style>
