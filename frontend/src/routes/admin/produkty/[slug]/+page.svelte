<script>
  import Editor from '$lib/admin/common/Editor.svelte';
  import Product from '$lib/admin/collections/product/Product.svelte';

  export let data;
  let { slug } = data;

  let title;
</script>

<Editor back="/admin/produkty" icon="products" {title}>
  <Product {slug} bind:title />
</Editor>
