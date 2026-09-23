<script>
  import MenuItems from './MenuItems.svelte';

  export let items;
  export let title = 'Katalog';
  /** Open branches in place (the phone menu) rather than by navigating. */
  export let expandable = false;
</script>

<nav class="rail" aria-label="Kategorie">
  <h2 class="rail__title label">{title}</h2>
  <MenuItems {items} {expandable} />
</nav>

<style>
  .rail__title {
    display: block;
    margin-bottom: var(--sp-2);
    color: var(--ink-400);
  }
</style>
