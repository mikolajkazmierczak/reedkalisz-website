<script>
  import { page } from '$lib/admin/stores';
  import Library from '$lib/admin/library/Library.svelte';

  $: $page = { title: 'Biblioteka plików', icon: 'library' };
</script>

<Library />

<slot />
