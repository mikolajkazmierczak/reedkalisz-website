<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import { me, readme } from '$lib/auth';
  import User from '$lib/components/User.svelte';
  import Button from '$lib/components/Button.svelte';

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
  <li><a href="/">Strona główna</a></li>
  <li><a href="/produkty">Produkty</a></li>
  <li><a href="/kolory">Kolory</a></li>
  <li><a href="/slider">Slider</a></li>
</nav>

<br />
<br />
<slot />
