<script>
  import { diff } from '$lib/utils';
  import { page, edited } from '$lib/admin/stores';
  import { updateGlobal, companies, labelings, priceViews, globalMargins } from '$lib/admin/global';

  import Table from '$lib/admin/common/Table.svelte';
  import Button from '$lib/admin/input/Button.svelte';

  $page = 'Kalkulacje';

  const fieldsToIgnore = ['user_created', 'date_created', 'user_updated', 'date_updated'];

  let companiesOriginal;
  let labelingsOriginal;
  let priceViewsOriginal;
  let globalMarginsOriginal;

  async function read() {
    await updateGlobal(companies);
    await updateGlobal(labelings);
    await updateGlobal(priceViews);
    await updateGlobal(globalMargins);
  }

  read();

  // $: diff(categoriesTree, categoriesTreeOriginal, fieldsToIgnore).then(({ changed }) => ($edited = changed));
</script>

{#if $companies && $labelings}
  {#each $companies as company}
    {@const items = $labelings.filter(l => l.company === company.id)}
    <h2>{company.name}</h2>
    {#each items as item}
      {item.name} {item.code} {item.type} <br />
    {/each}
  {/each}
{/if}
