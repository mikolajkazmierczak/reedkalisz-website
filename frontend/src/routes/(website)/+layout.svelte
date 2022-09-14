<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import { me, readme } from '$lib/auth';
  import User from '$lib/components/User.svelte';
  import Button from '$lib/components/Button.svelte';

  const menu = [
    { href: '/', title: 'Strona główna' },
    { href: '/produkty', title: 'Produkty' }
  ];

  function gotoAdmin() {
    goto('/admin');
  }

  onMount(readme);
</script>

<img src="/logo.svg" alt="logo" />
{#if $me}
  <User />
{/if}

<nav>
  <Button on:click={gotoAdmin}>Admin panel</Button>
  {#each menu as { href, title }}
    <li><a {href} class:current={href == $page.url.pathname}>{title}</a></li>
  {/each}
</nav>

<br />
<br />
<slot />

<style>
  a.current {
    font-weight: bold;
  }
</style>
