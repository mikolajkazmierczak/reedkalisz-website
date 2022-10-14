<script>
  import Editor from '$lib/admin/collections/category/Editor.svelte';

  export let data;
  let { slug } = data;
</script>

<Editor {slug} />
