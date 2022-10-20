<script>
  import Library from '$lib/admin/editors/library/Library.svelte';

  export let data;
  let { id } = data;
</script>

<Library {id} />
