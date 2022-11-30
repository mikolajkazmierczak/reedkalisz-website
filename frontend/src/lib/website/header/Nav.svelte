<script>
  import { menu } from '#/stores';
  import NavItem from './NavItem.svelte';

  export let openedID = null;

  function addLinks(items) {
    for (let item of items) {
      const productUrl = item.product ? `/produkty/${item.product.slug}` : null;
      const categoryUrl = item.category ? `/kategorie/${item.category.slug}` : null;
      const pageUrl = item.page ? `/${item.page.slug}` : null;
      item.href = productUrl || categoryUrl || pageUrl || item.url;
      if (item.children) addLinks(item.children);
    }
  }

  addLinks($menu);
</script>

<nav>
  {#each $menu as item}
    <NavItem {item} bind:openedID />
  {/each}
</nav>

<style>
  nav {
    display: flex;
    align-items: flex-end;
    gap: 15px;
    height: 100%;
  }
</style>
