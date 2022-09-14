<script>
  import { page, edited } from '$lib/admin/stores';
  import Library from '$lib/admin/library/Library.svelte';

  $: $page = 'Biblioteka plików';
  $: $edited = false;
</script>

<Library />
