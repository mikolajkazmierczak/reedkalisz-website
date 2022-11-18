<script>
  import { page } from '@/stores';
  import Library from '@c/library/Library.svelte';

  $: $page = { title: 'Biblioteka plików', icon: 'library' };
</script>

<Library />

<slot />
