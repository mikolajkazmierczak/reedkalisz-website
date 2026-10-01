<script>
  import Product from '@/editors/product/Product.svelte';

  export let data;
  // TODO (every editor's route): read once - going from this editor straight to another item's (same route, another
  // slug) keeps showing the first one; `$:` alone isn't it (the editor reads its item only when created), and
  // re-creating it on every slug change would also reload it after saving a new item or renaming one (its url changes)
  let { slug } = data;
</script>

<Product {slug} />
