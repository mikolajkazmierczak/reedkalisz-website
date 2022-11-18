<script>
  import Category from '@/editors/category/Category.svelte';

  export let data;
  let { slug } = data;
</script>

<Category {slug} />
