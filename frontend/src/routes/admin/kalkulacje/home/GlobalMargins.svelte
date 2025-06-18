<script>
  import { beforeNavigate } from '$app/navigation';
  import { slide } from 'svelte/transition';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { deep, diff } from '%/utils';

  import { recalculateProducts } from '@/calculations';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';

  const fieldsToIgnore = ['user_created', 'date_created', 'user_updated', 'date_updated'];

  export let data;
  let dataOriginal = deep.copy(data);

  let unsaved = false;
  let saving = false;

  beforeNavigate(navigation => {
    if (unsaved) {
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
    dataOriginal = deep.copy(data);
    heimdall.emit('global_margins', null, { refresh: true });

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
    data = deep.copy(dataOriginal);
    unsaved = false;
  }

  $: diff(data, dataOriginal, { fieldsToIgnore }).then(({ changed }) => (unsaved = changed));
</script>

<div class="margins">
  <div>
    <h4 style:color="#f90">Produkt</h4>
    <div class="ui-pair">
      <div class="input">
        <Input type="number" bind:value={data.product_margin}>Marża</Input>
        <small>%</small>
      </div>
      <div class="input">
        <Input type="number" bind:value={data.product_minimum}>Minimum</Input>
        <small>zł</small>
      </div>
    </div>
  </div>
  <div>
    <h4 style:color="#cc001d">Całość</h4>
    <div class="ui-pair">
      <div class="input">
        <Input type="number" bind:value={data.full_margin}>Marża</Input>
        <small>%</small>
      </div>
      <div class="input">
        <Input type="number" bind:value={data.full_minimum}>Minimum</Input>
        <small>zł</small>
      </div>
    </div>
  </div>
</div>

{#if unsaved}
  <div class="ui-pair edit" transition:slide={{ duration: 200 }}>
    <Button icon="close" dangerous on:click={cancel}>Anuluj</Button>
    <Button icon="ok" on:click={save}>
      {#if saving}Zapisuję...{:else}Zapisz{/if}
    </Button>
  </div>
{/if}

<style>
  .margins {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .input {
    position: relative;
  }
  .input small {
    pointer-events: none;
    position: absolute;
    bottom: 0.45rem;
    right: 0.45rem;
    opacity: 0.5;
  }

  .edit {
    margin-top: 1rem;
  }
</style>
