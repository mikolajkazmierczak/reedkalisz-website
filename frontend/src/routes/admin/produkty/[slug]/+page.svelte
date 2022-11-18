<script>
  import Product from '@/editors/product/Product.svelte';

  export let data;
  let { slug } = data;
</script>

<Product {slug} />
