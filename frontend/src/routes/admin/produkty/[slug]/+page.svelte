<script>
  import Editor from '$lib/admin/common/Editor.svelte';
  import Product from '$lib/admin/collections/product/Product.svelte';

  export let data;
  let { slug } = data;
</script>

<Editor back="/admin/produkty">
  <Product {slug} />
</Editor>
