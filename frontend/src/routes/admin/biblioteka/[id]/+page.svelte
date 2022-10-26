<script>
  import File from '$lib/admin/editors/file/File.svelte';

  export let data;
  let { id } = data;
</script>

<File {id} />
