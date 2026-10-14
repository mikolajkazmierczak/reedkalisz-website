<script>
  import MenuItems from './MenuItems.svelte';

  export let items;
  export let title = 'Katalog';
  /** Open branches in place (the phone menu) rather than by navigating. */
  export let expandable = false;
</script>

<nav class="rail" aria-label="Kategorie">
  <!-- not a heading: it would come before the page's h1 (the nav is named by its aria-label) -->
  <p class="rail__title label">{title}</p>
  <MenuItems {items} {expandable} />
</nav>

<style>
  .rail__title {
    margin-bottom: var(--sp-2);
    line-height: 1.08;
  }
</style>
