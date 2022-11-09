<script>
  import { slide } from 'svelte/transition';

  import api from '$lib/api';
  import socket from '$lib/admin/heimdall';
  import { diff } from '$lib/utils';
  import { recalculateProducts } from '$lib/admin/calculations';

  import { defaults } from '$lib/fields/price_views';
  import Input from '$lib/admin/input/Input.svelte';
  import Button from '$lib/admin/input/Button.svelte';
  import Popup from '$lib/admin/common/Popup.svelte';

  const fieldsToIgnore = ['user_created', 'date_created', 'user_updated', 'date_updated'];

  export let items;
  let itemsOriginal = JSON.parse(JSON.stringify(items));
  let edited = false;

  let saving = false;
  let inputErrors = [];

  let deleting = false;
  let deletingPriceViewID = null;
  let deletingPriceViewSwapID = null;

  function removingStart(i) {
    const item = items[i];
    deleting = true;
    deletingPriceViewID = item.id;
  }
  function removingCleanup() {
    deleting = false;
    deletingPriceViewID = null;
    deletingPriceViewSwapID = null;
  }
  async function remove() {
    saving = true;
    const item = items.find(i => i.id == deletingPriceViewID);
    const wasDefault = item.default;
    items = items.filter(i => i.id != deletingPriceViewID);
    if (wasDefault) items[0].default = true;
    if (item.id !== '+') {
      // get all products that use this price view
      // set their price view to the one selected in the popup
      const filter = { price_view: { _eq: deletingPriceViewID } };
      const { ids } = await recalculateProducts(filter, deletingPriceViewSwapID);
      // UPDATE PRICE_VIEWS
      await api.items('price_views').deleteOne(deletingPriceViewID);
      await api.items('price_views').updateOne(deletingPriceViewSwapID, { default: true });
      itemsOriginal = JSON.parse(JSON.stringify(items));

      const idsPriceViews = [deletingPriceViewID];
      if (deletingPriceViewSwapID) idsPriceViews.push(deletingPriceViewSwapID);
      socket.emitChanges('products', ids);
      socket.emitChanges('price_views', idsPriceViews);
    }
    saving = false;
    removingCleanup();
  }
  function removingCancel() {
    removingCleanup();
  }

  function push() {
    items.push(defaults());
    items = items;
  }
  async function save() {
    saving = true;
    const changes = diff(itemsOriginal, items, fieldsToIgnore);
    const ids = changes.map(c => c.id);
    changes.forEach(c => {
      api.items('price_views').updateOne(c.id, c);
    });
    socket.emitChanges('price_views', ids);
    itemsOriginal = JSON.parse(JSON.stringify(items));
    saving = false;
  }
  function cancel() {
    items = JSON.parse(JSON.stringify(itemsOriginal));
  }

  function setDefault(i) {
    items.forEach(item => (item.default = false));
    items[i].default = true;
    items = items;
    // api.
    // TODO: save changes to changed items
  }

  $: diff(items, itemsOriginal, fieldsToIgnore).then(({ changed }) => (edited = changed));
</script>

<div class="wrapper">
  <div class="items">
    {#each items as item, i}
      <div class="ui-list">
        <div class="item" class:default={item.default}>
          <Input placeholder="Nazwa..." bind:value={item.name} />
          <Input
            type="list"
            placeholder="np. 100;200"
            value={item.amounts.join(';')}
            bind:list={item.amounts}
            bind:error={inputErrors[i]}
          />
        </div>
        <div class="actions">
          {#if items.length > 1}
            <Button icon="delete" dangerous square on:click={() => removingStart(i)} />
          {/if}
          {#if !item.default}
            <Button icon="star" square on:click={() => setDefault(i)} />
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <Button icon="add" on:click={push}>Dodaj</Button>
  {#if !edited && saving}&nbsp;&nbsp;Zapisywanie...{/if}
  {#if edited && !inputErrors.some(e => e)}
    <div class="ui-pair" style:margin-top="1rem" transition:slide={{ duration: 200 }}>
      <Button icon="close" dangerous on:click={cancel}>Anuluj</Button>
      <Button icon="ok" on:click={save}>
        {#if saving}Zapisuję...{:else}Zapisz{/if}
      </Button>
    </div>
  {/if}
</div>

<Popup title="Jesteś pewny, że chcesz usunąć ten widok?" bind:opened={deleting}>
  <small>Możesz wybrać widok, który zastąpi usuwany<br />w produktach które z niego korzystają.</small>
  <Input
    type="select"
    bind:value={deletingPriceViewSwapID}
    options={items
      .filter(i => i.id != deletingPriceViewID)
      .map(({ id, name, amounts }) => ({ id, text: `${name} [${amounts}]` }))}
  >
    Widok
  </Input>
  <div class="ui-pair popup-actions">
    <Button on:click={removingCancel}>Anuluj</Button>
    <Button on:click={remove} dangerous>Usuń</Button>
  </div>
</Popup>

<style>
  .items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-radius: var(--border-radius);
    border: var(--border-light);
    padding: 0.5rem;
    background-color: var(--primary-white);
  }
  .item.default {
    outline: 2px dashed var(--primary);
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .popup-actions {
    margin-top: 1rem;
  }
</style>
