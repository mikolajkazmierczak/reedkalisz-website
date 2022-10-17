<script>
  import Editor from '$lib/admin/common/Editor.svelte';
  import Category from '$lib/admin/collections/category/Category.svelte';

  export let data;
  let { slug } = data;

  let title;
</script>

<Editor back="/admin/kategorie" icon="categories" {title}>
  <Category {slug} bind:title />
</Editor>
