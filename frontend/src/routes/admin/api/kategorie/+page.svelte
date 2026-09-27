<script>
  import CategoriesMappings from '../categories-mappings/CategoriesMappings.svelte';
  import MappingPage from '../MappingPage.svelte';
</script>

<MappingPage pathname="/admin/api/kategorie" title="Kategorie" search let:company let:apiItems let:query>
  <CategoriesMappings apiCompany={company} {apiItems} query={query ?? ''} />
</MappingPage>
