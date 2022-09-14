<script>
  import socket from '$lib/admin/heimdall';

  import { onDestroy, onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  import api from '$lib/api';
  import { me, readme } from '$lib/auth';
  import { errors } from '$lib/admin/stores';
  import { users } from '$lib/admin/global';
  import { read as fieldsUsers } from '$lib/fields/users';
  import Error from '$lib/admin/Error.svelte';
  import Login from '$lib/admin/Login.svelte';
  import Nav from '$lib/admin/nav/Nav.svelte';
  import Header from '$lib/admin/Header.svelte';
  import Loader from '$lib/components/Loader.svelte';

  async function getGlobals() {
    // read all users
    $users = (await api.items('directus_users').readByQuery({ fields: fieldsUsers })).data;
  }

  $: if ($me) getGlobals();

  let ready = false;
  onMount(async () => {
    await readme();
    ready = true;
    // catch all errors
    window.addEventListener('error', e => ($errors = [...$errors, e.reason.message]));
    window.addEventListener('unhandledrejection', e => ($errors = [...$errors, e.reason.message]));
  });

  socket.onChanges(data => {
    console.log(data);
  });

  onDestroy(() => {
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
    position: relative;
    padding: 5.5rem 1.5rem 1.5rem 5.5rem;
    width: 100%;
  }
</style>
