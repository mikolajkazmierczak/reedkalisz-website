<script>
  import ProductTile from '#c/ProductTile.svelte';
  export let products;
</script>

<div class="wrapper">
  {#if products.length}
    <div class="tiles">
      {#each products as product (product.id)}
        <ProductTile {product} />
      {/each}
    </div>
  {:else}
    Brak produktów o podanych parametrach
  {/if}
</div>

<style>
  .wrapper {
    margin-top: 3rem;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
</style>
