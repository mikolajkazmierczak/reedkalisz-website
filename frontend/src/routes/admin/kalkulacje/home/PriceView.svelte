<script>
  import { guardLeaving, tell } from '@/dialog';
  import { slide } from 'svelte/transition';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { deep, diff } from '%/utils';

  import { recalculateProducts } from '@/calculations';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Popup from '@c/Popup.svelte';

  // `default` property is handled separately
  const fieldsToIgnore = ['default', 'user_created', 'date_created', 'user_updated', 'date_updated'];

  export let items;
  export let item;
  let itemOriginal = deep.copy(item);

  let unsaved = false;
  let saving = false;
  let deleting = false;
  let deletingSaving = false; // prevent double click

  let swapID = null; // id of the price view that is being swapped with the one being deleted

  let inputError;

  guardLeaving(() => unsaved, {
    message: () =>
      `Zmiany w widoku "${item.name} (${item.amounts})" nie zostały zapisane. Czy na pewno chcesz opuścić stronę?`,
    discard: () => cancel(),
  });

  async function updateProducts(swapID = null) {
    const filter = { price_view: { _eq: item.id } };
    if (swapID) await recalculateProducts(filter, { newPriceView: swapID });
    else await recalculateProducts(filter);
  }

  async function save() {
    if (saving) return; // prevent double click
    saving = true;

    const { name, amounts } = item;
    amounts.sort((a, b) => a - b);
    if (item.id === '+') {
      const res = await api.items('price_views').createOne({ name, amounts, default: false });
      item.id = res.id;
    } else {
      await api.items('price_views').updateOne(item.id, { name, amounts });
      // UPDATE AFFECTED PRODUCTS
      const didAmountsChange = !deep.same(amounts, itemOriginal.amounts);
      if (didAmountsChange) await updateProducts();
    }
    heimdall.emit('price_views', item.id);
    itemOriginal = deep.copy(item);

    saving = false;
  }
  function cancel() {
    item = deep.copy(itemOriginal);
    unsaved = false;
  }

  async function setDefault() {
    const oldDefault = items.find((i) => i.default);
    item.default = true;
    oldDefault.default = false;
    await api.items('price_views').updateOne(item.id, { default: true });
    await api.items('price_views').updateOne(oldDefault.id, { default: false });
    heimdall.emit('price_views', [item.id, oldDefault.id]);
    items = items;
  }

  function removeStart() {
    if (deleting) return; // prevent double click
    if (item.id === '+') {
      items = items.filter((i) => i.id !== item.id);
    } else {
      const defaultID = items.find((i) => i.default).id;
      // the default one goes: another (saved) one takes its place
      swapID = defaultID === item.id ? (items.find((i) => i.id !== item.id && i.id !== '+')?.id ?? null) : defaultID;
      if (swapID == null) return tell('To jedyny zapisany widok. Najpierw zapisz inny, który zostanie domyślny.');
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
      const newDefaultItem = items.find((i) => i.id == newDefaultID);
      newDefaultItem.default = true;
      await api.items('price_views').updateOne(newDefaultID, { default: wasDefault });
    }

    // UPDATE AFFECTED PRODUCTS
    // first update products because some price view MUST always be set in the product editor (after refresh)
    await updateProducts(swapID);

    // UPDATE PRICE VIEWS
    await api.items('price_views').deleteOne(item.id);
    const ids = swapID ? [item.id, swapID] : [item.id];
    heimdall.emit('price_views', ids);
    items = items.filter((i) => i.id !== item.id);

    deletingSaving = false;
    removeFinish();
  }

  $: correct = !inputError && item.name && item.amounts.length;
  $: diff(item, itemOriginal, { fieldsToIgnore }).then(({ changed }) => (unsaved = changed));
</script>

<!-- the name with its buttons on the right, the amounts under it, then saving (when changed) -->
<div class="view">
  <div class="top">
    <div class="name"><Input size="small" placeholder="Nazwa..." bind:value={item.name} /></div>
    <!-- the default one is violet with a white star (the one new products get), the others can be made it -->
    <Button
      small
      icon="star"
      dashed={!item.default}
      background={item.default ? 'var(--purple-700)' : null}
      backgroundHover={item.default ? 'var(--purple-700)' : null}
      backgroundActive={item.default ? 'var(--purple-700)' : null}
      title={item.default ? 'Domyślny widok' : 'Ustaw jako domyślny'}
      disabled={item.id === '+'}
      on:click={() => !item.default && setDefault(item.id)} />
    {#if items.length > 1}
      <Button small icon="delete" dangerous title="Usuń" on:click={removeStart} />
    {/if}
  </div>
  <Input
    size="small"
    type="list"
    placeholder="np. 100;200"
    bind:value={item.amounts}
    bind:error={inputError}
    listDisallowString
    listDisallowNegative
    listDisallowZero />

  {#if unsaved && correct}
    <div class="save-actions" transition:slide={{ duration: 200 }}>
      <Button small icon="close" dangerous on:click={cancel}>Anuluj</Button>
      <Button small icon="ok" on:click={save}>
        {#if saving}Zapisuję...{:else}Zapisz{/if}
      </Button>
    </div>
  {/if}
</div>

<Popup
  title="Jesteś pewny, że chcesz usunąć ten widok?"
  maxWidth={'18.75rem'}
  bind:opened={deleting}
  on:close={removeFinish}>
  <small>Produkty, które korzystają z tego widoku potrzebują zamiennika.</small>
  <Input
    type="select"
    bind:value={swapID}
    options={items
      .filter(({ id }) => id !== '+' && id !== item.id)
      .map((i) => ({ id: i.id, text: `${i.default ? '(Domyślny) ' : ''}${i.name}`, note: i.amounts.join(', ') }))}>
    Widok zastępczy
  </Input>
  <div class="ui-pair popup-actions">
    <Button on:click={removeFinish}>Anuluj</Button>
    <Button on:click={remove} dangerous>
      {#if deletingSaving}
        Usuwanie...
      {:else}
        Usuń
      {/if}
    </Button>
  </div>
</Popup>

<style>
  .view {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
    border-radius: var(--box-radius);
    corner-shape: squircle;
    border: var(--border-light);
    background-color: var(--navy-100);
  }
  .top {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .name {
    flex: 1;
    min-width: 0;
  }
  .save-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }
  .popup-actions {
    margin-top: 1rem;
  }
</style>
