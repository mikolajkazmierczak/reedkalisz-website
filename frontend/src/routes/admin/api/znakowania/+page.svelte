<script>
  import Panel from '../mappings/Panel.svelte';
  import LabelingsMappings from '../labelings-mappings/LabelingsMappings.svelte';
  import MappingPage from '../MappingPage.svelte';
  import { hasPrintData, labelingCodes } from '../company.js';
</script>

<MappingPage pathname="/admin/api/znakowania" title="Znakowania" let:company let:apiItems>
  {#if hasPrintData(apiItems)}
    <LabelingsMappings apiCompany={company} apiCodes={labelingCodes(apiItems)} />
  {:else}
    <Panel title="Mapowanie znakowań">
      <p class="muted">
        Ostatni skan tego producenta nie zawiera danych o znakowaniach. Zeskanuj go ponownie w zakładce Produkty.
      </p>
    </Panel>
  {/if}
</MappingPage>
