<script>
  import SideRail from './SideRail.svelte';
  import { describe } from '#/seo';

  /** The rail's catalogue items. */
  export let items;
  /** A CMS fragment of HTML, carrying its own heading. */
  export let content;
  export let title;
</script>

<svelte:head>
  <title>{title} | REED Kalisz</title>
  <meta name="description" content={describe(content)} />
</svelte:head>

<div class="shell">
  <SideRail {items} />

  <div class="shell__main">
    <div class="wrap">
      <article class="doc prose">
        {@html content}
      </article>
    </div>
  </div>
</div>

<style>
  .doc {
    max-width: 72ch;
    padding: var(--sp-10) 0 var(--sp-16);
  }
  .doc :global(h1) {
    margin-bottom: var(--sp-6);
    color: var(--text);
    font-size: var(--fs-h1);
  }
  .doc :global(h2) {
    margin-top: var(--sp-10);
  }
  .doc :global(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--fs-sm);
  }
  .doc :global(th),
  .doc :global(td) {
    padding: var(--sp-2) var(--sp-3);
    border: 1px solid var(--border);
    text-align: left;
  }
</style>
