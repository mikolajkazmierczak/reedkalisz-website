<script>
  import { page, edited } from '$lib/admin/stores';
  import Library from '$lib/admin/library/Library.svelte';

  $: $page = { title: 'Biblioteka plików', icon: 'library' };
  $: $edited = false;
</script>

<Library />
