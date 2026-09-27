<script>
  import '$/fonts/fonts.css';
  import '$/styles/global.css';
  import latin from '$/fonts/bricolage-grotesque-latin.woff2';
  import latinExt from '$/fonts/bricolage-grotesque-latin-ext.woff2';
</script>

<!-- Hashed like the app's code, so browsers and Cloudflare keep them for good. -->
<svelte:head>
  {#each [latin, latinExt] as href}
    <link rel="preload" {href} as="font" type="font/woff2" crossorigin="anonymous" />
  {/each}
</svelte:head>

<slot />
