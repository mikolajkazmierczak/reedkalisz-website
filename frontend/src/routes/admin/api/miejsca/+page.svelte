<script>
  import Panel from '../mappings/Panel.svelte';
  import MappingPage from '../MappingPage.svelte';
  import PlacesMappings from '../places-mappings/PlacesMappings.svelte';
  import { hasPrintData } from '../company.js';
</script>

<MappingPage pathname="/admin/api/miejsca" title="Miejsca" let:company let:apiItems>
  {#if hasPrintData(apiItems)}
    <PlacesMappings apiCompany={company} {apiItems} />
  {:else}
    <Panel title="Mapowanie miejsc znakowań">
      <p class="muted">
        Ostatni skan tego producenta nie zawiera danych o znakowaniach. Zeskanuj go ponownie w zakładce Produkty.
      </p>
    </Panel>
  {/if}
</MappingPage>
