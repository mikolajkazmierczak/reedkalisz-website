<script>
  import Editor from '$lib/admin/collections/product/Editor.svelte';

  export let data;
  let { slug } = data;
</script>

<Editor {slug} />
