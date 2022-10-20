<script>
  import Product from '$lib/admin/editors/product/Product.svelte';

  export let data;
  let { slug } = data;
</script>

<Product {slug} />
