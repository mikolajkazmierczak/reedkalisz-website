<script context="module">
  import api from '$lib/api';
  export async function load() {
    try {
      const res = await api.items('products').readByQuery({
        limit: -1
      });
      return { props: { products: res.data } };
    } catch (err) {
      console.log(err);
      return { props: { products: null } };
    }
  }
</script>

<script>
  export let products;
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
