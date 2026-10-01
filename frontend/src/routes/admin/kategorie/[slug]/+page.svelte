<script>
  import Category from '@/editors/category/Category.svelte';

  export let data;
  // TODO: read once (see produkty/[slug])
  let { slug } = data;
</script>

<Category {slug} />
