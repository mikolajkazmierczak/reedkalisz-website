<script>
  import '$/styles/ui-website.css';
  import { onMount } from 'svelte';

  import { me, readme } from '$/auth';
  import Admin from '#/Admin.svelte';
  import Header from '#/header/Header.svelte';

  onMount(readme);
</script>

<svelte:head>
  <style>
    body {
      overflow-y: scroll;
    }
  </style>
</svelte:head>

{#if $me}
  <Admin />
{/if}

<Header />

<main>
  <div class="content">
    <slot />
  </div>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
  }
  .content {
    width: 100%;
    max-width: 1200px;
    padding: 30px 20px;
  }
</style>
