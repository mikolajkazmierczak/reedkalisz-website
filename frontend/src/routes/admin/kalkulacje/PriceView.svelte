<script>
  import { beforeNavigate } from '$app/navigation';
  import { slide } from 'svelte/transition';

  import api from '$lib/api';
  import socket from '$lib/admin/heimdall';
  import { diff } from '$lib/utils';

  import { recalculateProducts } from '$lib/admin/calculations';
  import Input from '$lib/admin/input/Input.svelte';
  import Button from '$lib/admin/input/Button.svelte';
  import Popup from '$lib/admin/common/Popup.svelte';

  // `default` property is handled separately
  const fieldsToIgnore = ['default', 'user_created', 'date_created', 'user_updated', 'date_updated'];

  export let items;
  export let item;
  let itemOriginal = JSON.parse(JSON.stringify(item));

  let edited = false;
  let saving = false;
  let deleting = false;
  let deletingSaving = false; // prevent double click

  let swapID = null; // id of the price view that is being swapped with the one being deleted

  let inputError;

  beforeNavigate(navigation => {
    if (edited) {
      const prompt = `Zmiana widoku "${item.name} ${item.amounts}" nie zostały zapisane. Czy na pewno chcesz opuścić stronę?`;
      if (confirm(prompt)) {
        cancel();
      } else navigation.cancel();
    }
  });

  async function save() {
    if (saving) return; // prevent double click
    saving = true;
    const { name, amounts } = item;
    if (item.id === '+') {
      const res = await api.items('price_views').createOne({ name, amounts, default: false });
      item.id = res.id;
    } else {
      await api.items('price_views').updateOne(item.id, { name, amounts });
      // UPDATE AFFECTED PRODUCTS
      const amountsChanged = JSON.stringify(amounts) !== JSON.stringify(itemOriginal.amounts);
      if (amountsChanged) {
        const filter = { price_view: { _eq: item.id } };
        await recalculateProducts(filter);
      }
    }
    socket.emitChanges('price_views', item.id);
    itemOriginal = JSON.parse(JSON.stringify(item));
    saving = false;
  }
  function cancel() {
    item = JSON.parse(JSON.stringify(itemOriginal));
    edited = false;
  }

  async function setDefault() {
    const oldDefault = items.find(i => i.default);
    item.default = true;
    oldDefault.default = false;
    await api.items('price_views').updateOne(item.id, { default: true });
    await api.items('price_views').updateOne(oldDefault.id, { default: false });
    socket.emitChanges('price_views', [item.id, oldDefault.id]);
    items = items;
  }

  function removeStart() {
    if (deleting) return; // prevent double click
    if (item.id === '+') {
      items = items.filter(i => i.id !== item.id);
    } else {
      const defaultID = items.find(i => i.default).id;
      swapID = defaultID === item.id ? items[0].id : defaultID;
      deleting = true;
    }
  }
  function removeFinish() {
    swapID = null;
    deleting = false;
  }
  async function remove() {
    deletingSaving = true;

    // set new default if needed
    const wasDefault = item.default;
    if (wasDefault) {
      const newDefaultID = swapID;
      const newDefaultItem = items.find(i => i.id == newDefaultID);
      newDefaultItem.default = true;
      await api.items('price_views').updateOne(newDefaultID, { default: wasDefault });
    }

    // UPDATE AFFECTED PRODUCTS
    // first update products because some price view MUST always be set in the product editor (after refresh)
    const filter = { price_view: { _eq: item.id } };
    await recalculateProducts(filter, { newPriceView: swapID });

    // UPDATE PRICE VIEWS
    await api.items('price_views').deleteOne(item.id);
    const ids = swapID ? [item.id, swapID] : [item.id];
    socket.emitChanges('price_views', ids);

    items = items.filter(i => i.id !== item.id);

    deletingSaving = false;
    removeFinish();
  }

  $: correct = !inputError && item.name && item.amounts.length;
  $: diff(item, itemOriginal, fieldsToIgnore).then(({ changed }) => (edited = changed));
</script>

<div class="ui-list">
  <div class="wrapper">
    <div class="item" class:default={item.default}>
      <Input placeholder="Nazwa..." bind:value={item.name} />
      <Input
        type="list"
        placeholder="np. 100;200"
        bind:value={item.amounts}
        bind:error={inputError}
        listDisallowString
        listDisallowNegative
        listDisallowZero
      />
    </div>

    {#if edited && correct}
      <div class="ui-pair save-actions" transition:slide={{ duration: 200 }}>
        <Button icon="close" dangerous on:click={cancel}>Anuluj</Button>
        <Button icon="ok" on:click={save}>
          {#if saving}Zapisuję...{:else}Zapisz{/if}
        </Button>
      </div>
    {/if}
  </div>

  <div class="item-actions">
    {#if items.length > 1}
      <Button icon="delete" square dangerous on:click={removeStart} />
    {/if}
    {#if !item.default}
      <Button icon="star" square on:click={() => setDefault(item.id)} disabled={item.id === '+'} />
    {/if}
  </div>
</div>

<Popup
  title="Jesteś pewny, że chcesz usunąć ten widok?"
  maxWidth={'300px'}
  bind:opened={deleting}
  on:close={removeFinish}
>
  <small>Produkty, które korzystają z tego widoku potrzebują zamiennika.</small>
  <Input
    type="select"
    bind:value={swapID}
    options={items
      .filter(({ id }) => id !== '+' && id !== item.id)
      .map(i => ({ id: i.id, text: `${i.default ? '(Domyślny) ' : ''}${i.name} [${i.amounts}]` }))}
  >
    Widok zastępczy
  </Input>
  <div class="ui-pair popup-actions">
    <Button on:click={removeFinish}>Anuluj</Button>
    <Button on:click={remove} dangerous>
      {#if deletingSaving} Usuwanie... {:else} Usuń {/if}
    </Button>
  </div>
</Popup>

<style>
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
    outline: var(--outline-dashed);
  }

  .item-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .save-actions {
    margin-top: 0.75rem;
  }
  .popup-actions {
    margin-top: 1rem;
  }
</style>
