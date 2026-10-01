<script>
  import File from '@/editors/file/File.svelte';

  export let data;
  // TODO: read once (see produkty/[slug])
  let { id } = data;
</script>

<File {id} />
