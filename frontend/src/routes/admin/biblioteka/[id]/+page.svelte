<script>
  import File from '@/editors/file/File.svelte';

  export let data;
  let { id } = data;
</script>

<File {id} />
