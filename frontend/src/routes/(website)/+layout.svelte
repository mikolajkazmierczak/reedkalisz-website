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
  <div class="bg" />
</div>

<Footer fragments={data.footer} menu={data.menus.footer} />

<style>
  .wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding-top: 6rem;
    min-height: calc(100% - 16rem); /* footer height */
  }
  .bg {
    z-index: -1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    /* background: linear-gradient(345deg, var(--main-0) 0%, #fff 100%); */
  }
</style>
