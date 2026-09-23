<script>
  import '$/styles/ui-website.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  import { me, readme } from '$/auth';
  import Admin from '#/Admin.svelte';
  import MobileBar from '#/shell/MobileBar.svelte';
  import Footer from '#/footer/Footer.svelte';
  import { SITE } from '#/seo';

  export let data;

  onMount(readme);

  // Canonical keeps only the page number; sort, size and search are views of the same list.
  $: pageNo = Number($page.url.searchParams.get('p')) || 1;
  $: canonical = SITE + $page.url.pathname + (pageNo > 1 ? `?p=${pageNo}` : '');
</script>

<svelte:head>
  <link rel="canonical" href={canonical} />
  <meta property="og:site_name" content="REED Kalisz" />
  <meta property="og:locale" content="pl_PL" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonical} />
</svelte:head>

{#if $me}
  <Admin />
{/if}

<a class="skip-link" href="#main">Przejdź do treści</a>

<div class="sheet">
  <MobileBar sideMenu={data.menus.side} />

  <main id="main">
    <slot />
  </main>

  <Footer fragments={data.footerFragments} />
</div>
