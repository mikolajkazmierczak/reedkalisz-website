<script>
  import { page as route } from '$app/stores';
  import { header } from '@/stores';
  import { searchparams, SearchParams } from '$/searchparams';
  import Library from '@c/library/Library.svelte';

  $header = { title: 'Biblioteka plików', icon: 'library' };

  const searchParams = new SearchParams('/admin/biblioteka');
  $: [limit, page, query] = $searchparams.get(searchParams.pathname).values();
</script>

<!-- an open file's editor has its own upload (a replacement) -->
<Library {searchParams} {limit} {page} {query} dropping={!$route.params.id} />

<slot />
