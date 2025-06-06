<script>
  import ProductTile from './ProductTile.svelte';

  export let products;
</script>

<div class="tiles">
  {#each products as product (product.id)}
    {#if product.url}
      <a href={product.url} class="href-tile" target="_blank" rel="noreferrer">
        <div class="img-wrapper">
          <img src={product.img} alt={product.alt} />
        </div>
        <div class="info">
          <div class="title">{product.title}</div>
          <div>{product.subtitle}</div>
        </div>
      </a>
    {:else}
      <ProductTile {product} />
    {/if}
  {/each}
</div>

<style>
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.75rem 1rem;
  }

  /* temporary custom tile */
  .href-tile {
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0, 0, 0, 0.1);
    text-decoration: none;
    background-color: rgb(250, 250, 250);
  }
  .href-tile:hover {
    background-color: var(--main-0);
  }

  .href-tile .img-wrapper {
    width: 100%;
    aspect-ratio: 1 / 1;
    background-color: #fff;
  }
  .href-tile .img-wrapper img {
    object-fit: cover;
    display: block;
    width: 100%;
    height: 100%;
    aspect-ratio: 1 / 1;
  }

  .href-tile .info {
    position: relative;
    padding: 0.8rem;
    padding-top: 1rem;
    padding-bottom: 1.2rem;
    font-size: 1.3rem;
  }
  .href-tile .info .title {
    font-size: 1.5rem;
    font-weight: bold;
  }
</style>
