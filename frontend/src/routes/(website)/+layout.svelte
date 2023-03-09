<script>
  import '$/styles/ui-website.css';
  import { onMount } from 'svelte';

  import { me, readme } from '$/auth';
  import Admin from '#/Admin.svelte';
  import Header from '#/header/Header.svelte';
  import Footer from '#/footer/Footer.svelte';

  export let data;

  onMount(readme);
</script>

{#if $me}
  <Admin />
{/if}

<Header menu={data.menus.top} />

<div class="wrapper">
  <slot />
</div>

<Footer fragments={data.footer} menu={data.menus.footer} />

<style>
  .wrapper {
    min-height: calc(100% - 18rem); /* footer height */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }
</style>
