<script>
  export let data;
  let { products } = data;
</script>

<h2>Produkty</h2>
{#if products}
  {#each products as product}
    <div>
      <p>{product.name}</p>
      <p>{JSON.stringify(product)}</p>
    </div>
  {/each}
{/if}
