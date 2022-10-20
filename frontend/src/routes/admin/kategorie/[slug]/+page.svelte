<script>
  import Category from '$lib/admin/editors/category/Category.svelte';

  export let data;
  let { slug } = data;
</script>

<Category {slug} />
