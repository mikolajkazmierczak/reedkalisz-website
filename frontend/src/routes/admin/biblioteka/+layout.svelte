<script>
  import { header } from '@/stores';
  import { searchparams, SearchParamsManager } from '$/searchparams';
  import Library from '@c/library/Library.svelte';

  $header = { title: 'Biblioteka plików', icon: 'library' };

  const searchParams = new SearchParamsManager('/admin/biblioteka');
  $: [limit, page, query] = $searchparams.get(searchParams.pathname).values();
</script>

<Library {searchParams} {limit} {page} {query} />

<slot />
