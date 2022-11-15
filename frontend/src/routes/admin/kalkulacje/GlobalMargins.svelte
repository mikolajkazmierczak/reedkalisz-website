<script>
  import { beforeNavigate } from '$app/navigation';
  import { slide } from 'svelte/transition';

  import api from '$lib/api';
  import socket from '$lib/admin/heimdall';
  import { diff } from '$lib/utils';
  import { recalculateProducts } from '$lib/admin/calculations';

  import Input from '$lib/admin/input/Input.svelte';
  import Button from '$lib/admin/input/Button.svelte';

  const fieldsToIgnore = ['user_created', 'date_created', 'user_updated', 'date_updated'];

  export let data;
  let dataOriginal = JSON.parse(JSON.stringify(data));
  let edited = false;

  let saving = false;

  beforeNavigate(navigation => {
    if (edited) {
      const prompt = `Zmiany w marżach nie zostały zapisane. Czy na pewno chcesz opuścić stronę?`;
      if (confirm(prompt)) {
        cancel();
      } else navigation.cancel();
    }
  });

  async function save() {
    if (saving) return; // prevent double click
    saving = true;

    // UPDATE GLOBAL MARGINS
    const { full_margin, full_minimum, product_margin, product_minimum } = data;
    const updates = { full_margin, full_minimum, product_margin, product_minimum };
    data = await api.singleton('global_margins').update(updates);
    dataOriginal = JSON.parse(JSON.stringify(data));
    socket.emitChanges('global_margins', 1);

    // UPDATE all PRODUCTS that both:
    // - have either global_full_margin or global_product_margin set to true
    // - have any labelings set
    await recalculateProducts({
      _and: [
        { _or: [{ global_full_margin: { _eq: true } }, { global_product_margin: { _eq: true } }] },
        { 'count(labelings)': { _neq: 0 } }
      ]
    });

    saving = false;
  }
  async function cancel() {
    data = JSON.parse(JSON.stringify(dataOriginal));
    edited = false;
  }

  $: diff(data, dataOriginal, fieldsToIgnore).then(({ changed }) => (edited = changed));
</script>

<div class="wrapper">
  <div class="ui-pair margins">
    <div>
      <h4>Na całość</h4>
      <div class="ui-pair">
        <Input type="number" bind:value={data.full_margin}>Marża</Input>
        <Input type="number" bind:value={data.full_minimum}>Minimum</Input>
      </div>
    </div>
    <div>
      <h4>Na produkt</h4>
      <div class="ui-pair">
        <Input type="number" bind:value={data.product_margin}>Marża</Input>
        <Input type="number" bind:value={data.product_minimum}>Minimum</Input>
      </div>
    </div>
  </div>

  {#if edited}
    <div class="ui-pair edit" transition:slide={{ duration: 200 }}>
      <Button icon="close" dangerous on:click={cancel}>Anuluj</Button>
      <Button icon="ok" on:click={save}>
        {#if saving}Zapisuję...{:else}Zapisz{/if}
      </Button>
    </div>
  {/if}
</div>

<style>
  .margins {
    gap: 0.5rem;
  }
  .margins > div {
    padding: 0.5rem;
    border-radius: var(--border-radius);
    border: var(--border-light);
  }
  .edit {
    margin-top: 0.5rem;
  }
</style>
