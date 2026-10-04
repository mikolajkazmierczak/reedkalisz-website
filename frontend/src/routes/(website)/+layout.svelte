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

  <!-- Umami: the website only, never the admin panel, beta or localhost (and never an admin's browser, see readme) -->
  <script
    defer
    src="https://cloud.umami.is/script.js"
    data-website-id="01971f3c-6cfe-424a-a191-f1074d749a90"
    data-domains="reed.kalisz.pl"></script>
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
