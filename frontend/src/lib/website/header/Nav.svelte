<script>
  import { menu } from '#/stores';
  import NavItem from './NavItem.svelte';

  let openedID = null;

  const items = $menu.map(item => {
    const productUrl = item.product ? `/produkty/${item.product.slug}` : null;
    const categoryUrl = item.category ? `/kategorie/${item.category.slug}` : null;
    const pageUrl = item.page ? `/${item.page.slug}` : null;
    const href = productUrl || categoryUrl || pageUrl || item.url;
    return { ...item, href };
  });
</script>

<nav>
  {#each items as item}
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
