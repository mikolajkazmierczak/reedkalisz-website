<script>
  import { slide } from 'svelte/transition';

  import api from '$lib/api';
  import { diff } from '$lib/utils';
  import Input from '$lib/admin/input/Input.svelte';
  import Button from '$lib/admin/input/Button.svelte';

  const fieldsToIgnore = ['user_created', 'date_created', 'user_updated', 'date_updated'];

  export let data;
  let dataOriginal = JSON.parse(JSON.stringify(data));
  let edited = false;

  async function save() {
    const { full_margin, full_minimum, product_margin, product_minimum } = data;
    const updates = { full_margin, full_minimum, product_margin, product_minimum };
    // WIP
    // get products that need updating
    // const products = (await api.items('products').readByQuery({
    //   fields: ['id', 'full_margin', 'full_minimum', 'product_margin', 'product_minimum'],
    //   filter: { full_margin: { _neq: full_margin }, full_minimum: { _neq: full_minimum } },
    // })).data;
    // update global margins
    data = await api.singleton('global_margins').update(updates);
    dataOriginal = JSON.parse(JSON.stringify(data));
  }
  async function cancel() {
    data = JSON.parse(JSON.stringify(dataOriginal));
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
    <div class="ui-pair" style:margin-top="1rem" transition:slide={{ duration: 200 }}>
      <Button icon="close" dangerous on:click={cancel}>Anuluj</Button>
      <Button icon="ok" on:click={save}>Zapisz</Button>
    </div>
  {/if}
</div>

<style>
  .margins {
    gap: 2rem;
    max-width: 35ch;
  }
</style>
