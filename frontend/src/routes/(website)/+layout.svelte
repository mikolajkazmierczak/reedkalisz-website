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
  <div class="content">
    <slot />
  </div>
  <div class="bg" />
</div>

<Footer fragments={data.footerFragments} menu={data.menus.footer} />

<style>
  .wrapper {
    position: relative;
    display: grid;
    padding-top: 5rem;
    min-height: calc(100% - 16rem); /* footer height */
  }

  .content {
    padding: 0 4rem;
    width: 100%;
  }

  .bg {
    z-index: -1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    /* background-color: rgba(191, 4, 23, 0.02); */
    /* background: linear-gradient(315deg, rgba(191, 4, 23, 0.2) 0%, #fff 100%); */
    /* background: linear-gradient(340deg, rgba(0, 0, 0, 0.05) 0%, #fff 100%); */
    background-color: rgba(191, 4, 23, 0.07);
    -webkit-mask-image: url('/topography.svg');
    mask-image: url('/topography.svg');
  }
</style>
