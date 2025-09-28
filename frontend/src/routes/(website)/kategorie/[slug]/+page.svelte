<script>
  import { marked } from 'marked';
  import Pagination from '#c/Pagination.svelte';
  import Menu from '#/menu/Menu.svelte';
  import Products from '#/products/Products.svelte';

  export let data;
</script>

<svelte:head>
  <!-- TODO: those should be fragments (or a singleton? but probably a bad idea) -->
  <title>Gadżety reklamowe | REED Kalisz</title>
  <meta
    name="description"
    content="Firma Reed przedstawia gadżety dla firm, takie jak długopisy reklamowe, kalendarze czy kubki. Oferujemy również cyfrowy druk niskonakładowy i grawerowanie laserowe."
  />
</svelte:head>

<div class="wrapper">
  <Menu items={data.menus.side} />

  <main>
    {#if data.category?.description}
      <div class="description">
        <h1>{data.category.name}</h1>
        <p>{@html marked.parse(data.category.description)}</p>
      </div>
    {/if}
    {#if data.products && data.products.length}
      <Pagination limit={data.limit} page={data.page} count={data.count} />
      <Products products={data.products} />
      <Pagination limit={data.limit} page={data.page} count={data.count} />
    {:else}
      Brak produktów o podanych parametrach
    {/if}
  </main>
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 18rem 1fr;
    gap: 3rem;
    width: 100%;
  }

  main {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem 0;
  }
  .description {
    background-color: rgba(255, 255, 255, 0.185);
    backdrop-filter: blur(2px);
    border-radius: 1rem;
    border: 1px solid rgb(214, 214, 214);
    padding: 1.5rem 2rem;
  }
  :global(.description p, .description ul) {
    margin: 0.5rem;
  }
</style>
