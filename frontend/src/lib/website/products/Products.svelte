<script>
  import ProductTile from '#c/ProductTile.svelte';
  import Menu from './Menu.svelte';

  export let menu;
  export let products;
</script>

<div class="wrapper">
  <div class="menu">
    <Menu items={menu} />
  </div>

  <div class="products">
    {#if products && products.length}
      <div class="tiles">
        {#each products as product (product.id)}
          <ProductTile {product} />
        {/each}
      </div>
    {:else}
      Brak produktów o podanych parametrach
    {/if}
  </div>
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 1fr 3fr;
    width: 100%;
  }

  .menu {
    padding: 3.5rem 4.1rem;
    padding-right: 0;
  }

  .products {
    padding: 4.1rem;
    padding-left: 0;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem 0.75rem;
  }
</style>
