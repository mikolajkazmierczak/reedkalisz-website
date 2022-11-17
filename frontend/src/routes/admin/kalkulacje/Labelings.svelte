<script>
  import { slide } from 'svelte/transition';

  import api from '$lib/api';
  import socket from '$lib/admin/heimdall';
  import { diff, moveItem } from '$lib/utils';
  import { recalculateProducts } from '$lib/admin/calculations';

  import { read as fields, defaults } from '$lib/fields/labelings';
  import Icon from '$lib/common/Icon.svelte';
  import Input from '$lib/admin/input/Input.svelte';
  import Button from '$lib/admin/input/Button.svelte';
  import HoverCircle from '$lib/components/HoverCircle.svelte';
  import Popup from '$lib/admin/common/Popup.svelte';

  export let company;
  export let items;
  let itemsOriginal = JSON.parse(JSON.stringify(items));
  $: itemsEdited = itemsOriginal.map(() => false);
  $: itemsHTML = itemsOriginal.map(() => '');

  $: edited = itemsEdited.some(e => e);
  let saving = false;
  let deleting = false;
  let deletingSaving = false; // prevent double click

  let deletingID = null; // id of the labeling that is being deleted
  let swapID = null; // id of the labeling that is being swapped with the one being deleted

  // `default` and `index` properties are handled separately
  const fieldsToIgnore = ['default', 'index', 'user_created', 'date_created', 'user_updated', 'date_updated'];

  async function save() {
    if (saving) return;
    saving = true;

    const ids = [];
    for (const [i, item] of items.entries()) {
      if (itemsEdited[i]) {
        const data = JSON.parse(JSON.stringify(item));
        delete data.id;
        for (const field of fieldsToIgnore) delete data[field];
        data.prices.sort((a, b) => a.amount - b.amount); // sort prices by amounts
        await api.items('labelings').updateOne(item.id, data);
        ids.push(item.id);

        // UPDATE AFFECTED PRODUCTS
        const filter = { labelings: { labeling: { _eq: item.id } } };
        await recalculateProducts(filter);

        items[i] = await api.items('labelings').readOne(item.id, { fields });
        itemsOriginal[i] = JSON.parse(JSON.stringify(items[i]));
      }
    }
    socket.emitChanges('labelings', ids);
    items = items;
    itemsOriginal = itemsOriginal;

    saving = false;
  }
  function cancel() {
    items = JSON.parse(JSON.stringify(itemsOriginal));
    edited = false;
  }

  function newLabeling() {
    const data = defaults();
    data.company = company.id;
    data.index = items.length;
    for (const amount of amounts) {
      data.prices.push({ amount, price: null });
    }
    delete data.id;
    return data;
  }
  async function addLabeling() {
    // save to api immediately to get id
    const data = newLabeling();
    if (items.length == 0) {
      data.prices.push({ amount: 1, price: null }); // lumpsum is mandatory
    }
    const item = await api.items('labelings').createOne(data, { fields });
    socket.emitChanges('labelings', item.id);
    items = [...items, item];
    itemsOriginal = [...itemsOriginal, JSON.parse(JSON.stringify(item))];
  }

  async function setDefault(i) {
    const item = items[i];
    const oldDefault = items.find(i => i.default);
    item.default = true;
    oldDefault.default = false;
    await api.items('labelings').updateOne(item.id, { default: true });
    await api.items('labelings').updateOne(oldDefault.id, { default: false });
    socket.emitChanges('labelings', [item.id, oldDefault.id]);
    items = items;
  }

  async function moveLabeling(i, d) {
    items = moveItem(items, i, d);

    // save affected items to api
    const ids = [];
    for (const index of [i, i + d]) {
      const item = items[index];
      await api.items('labelings').updateOne(item.id, { index });
      ids.push(item.id);
    }

    socket.emitChanges('labelings', ids);
    itemsOriginal = JSON.parse(JSON.stringify(items));
  }

  function removeStart(i) {
    if (deleting) return; // prevent double click
    deletingID = items[i].id;
    deleting = true;
  }
  function removeFinish() {
    deletingID = null;
    swapID = null;
    deleting = false; // TODO: this may potentially interrupt saving
  }
  async function remove() {
    deletingSaving = true;

    const i = items.findIndex(i => i.id === deletingID);
    const item = items[i];
    let updatedIDs = [];

    // set new default if needed
    const wasDefault = item.default;
    if (wasDefault) {
      const newDefaultID = swapID === null ? items[0].id : swapID;
      const newDefaultItem = items.find(i => i.id == newDefaultID);
      newDefaultItem.default = true;
      await api.items('labelings').updateOne(newDefaultID, { default: wasDefault });
      updatedIDs.push(newDefaultID);
    }

    // UPDATE AFFECTED PRODUCTS
    const filter = { labelings: { labeling: { _eq: item.id } } };
    const swapLabelings = new Map([[deletingID, swapID]]); // will delete the labeling if swapID is null
    await recalculateProducts(filter, { swapLabelings });

    // UPDATE LABELINGS
    await api.items('labelings').deleteOne(item.id);
    updatedIDs.push(item.id);
    // update indexes
    for (let i = 0; i < items.length; i++) {
      items[i].index = i;
      itemsOriginal[i].index = i;
      await api.items('labelings').updateOne(items[i].id, { index: i });
    }
    // add ids from items with updated indexes
    updatedIDs.push(items.filter(i => i.index >= item.index).map(i => i.id));
    socket.emitChanges('labelings', updatedIDs);

    items = items.filter(i => i.id !== item.id);
    itemsOriginal = itemsOriginal.filter(i => i.id !== item.id);

    deletingSaving = false;
    removeFinish();
  }

  function pushAmount() {
    const i = amounts.length - 1;
    const amount = amounts[i] + 1;
    for (const item of items) {
      item.prices.push({ amount, price: null });
    }
    items = items;
    amounts.push(amount);
    amounts = amounts;
  }
  function removeAmount() {
    const i = amounts.length - 1;
    for (const item of items) {
      item.prices.splice(i, 1);
    }
    items = items;
    amounts.splice(i, 1);
    amounts = amounts;
  }
  function updatePricesFromAmounts(amounts) {
    for (const [i, amount] of amounts.entries()) {
      for (const item of items) {
        item.prices[i].amount = amount;
      }
    }
    items = items;
  }

  function checkDiff(items) {
    for (const [i, itemOriginal] of itemsOriginal.entries()) {
      const item = items.find(i => i.id == itemOriginal.id);
      diff(item, itemOriginal, fieldsToIgnore).then(({ changed, html }) => {
        itemsEdited[i] = changed;
        itemsHTML[i] = html;
      });
    }
  }
  let amounts = [];
  function updateAmounts() {
    // TODO: doesn't work when items are deleted
    amounts = items.length ? items[0].prices.map(p => p.amount) : [];
  }
  $: if (itemsOriginal) updateAmounts();
  $: updatePricesFromAmounts(amounts);
  $: checkDiff(items);
</script>

<Popup
  title="Jesteś pewny, że chcesz usunąć to znakowanie?"
  maxWidth={'300px'}
  bind:opened={deleting}
  on:close={removeFinish}
>
  <small>W produktach, które korzystają z tego znakowania zostanie ono usunięte. Możesz też wybrać zamiennik.</small>
  <Input
    type="select"
    bind:value={swapID}
    options={[{ id: null, text: 'Bez zamiennika' }].concat(
      items
        .filter(({ id }) => id !== deletingID)
        .map(({ id, code, type, name }) => {
          return { id, text: `${company.name} ${code || '-'} ${type || '-'} ${name || '-'}` };
        })
    )}
  >
    Znakowanie zastępcze
  </Input>
  <div class="ui-pair popup-actions">
    <Button on:click={removeFinish}>Anuluj</Button>
    <Button on:click={remove} dangerous>
      {#if deletingSaving} Usuwanie... {:else} Usuń {/if}
    </Button>
  </div>
</Popup>

{#if items.length}
  <div class="wrapper">
    <table class="ui-table">
      <tr>
        <th width="30" class="icon">
          <div class="icon"><Icon name="star" /></div>
        </th>
        <th width="30" class="icon">
          <div class="icon"><Icon name="arrow_up" /></div>
        </th>
        <th width="30" class="icon">
          <div class="icon"><Icon name="arrow_down" /></div>
        </th>
        <th width="30" class="icon heavy-border">
          <div class="icon"><Icon name="delete" /></div>
        </th>

        <th width="70">Kod</th>
        <th width="70">Typ</th>
        <th width="140" class="heavy-border">Nazwa</th>
        <th width="70" title={'Przygotowalnia'}>
          P <span class="info">🛈</span>
        </th>
        <th width="70" title={'Transport'}>
          T <span class="info">🛈</span>
        </th>
        <th width="70" title={'Próg dla uwzględnienia transportu'}>
          TP <span class="info">🛈</span>
        </th>
        <th width="70" title={'Marża'}>
          M <span class="info">🛈</span>
        </th>
        <th width="70" title={'Minimum'} class="heavy-border">
          MIN <span class="info">🛈</span>
        </th>

        {#each amounts as amount}
          {#if amount == 1}
            <th width="80" class="amount fixed"><small>Ryczałt</small></th>
          {:else}
            <th width="80" class="amount">
              <Input type="number" borderless min={0} step={1} bind:value={amount} />
            </th>
          {/if}
        {/each}
        <th width="30" rowspan={items.length} class="action action-amount action-amount-add">
          <button on:click={pushAmount}>
            <HoverCircle />
            <div class="icon"><Icon name="add" light /></div>
          </button>
        </th>
      </tr>

      {#each items as item, i}
        <tr>
          <td class="input action default" class:default={item.default}>
            {#if !item.default}
              <button on:click={() => setDefault(i)}>
                <HoverCircle color={'var(--accent-light)'} />
                <div class="icon"><Icon name="star" /></div>
              </button>
            {:else}
              <div class="dummy" title={'To jest znakowanie domyślne'} />
            {/if}
          </td>
          <td class="input action up">
            {#if !i == 0}
              <button on:click={() => moveLabeling(i, -1)}>
                <HoverCircle color={'var(--accent-light)'} />
                <div class="icon"><Icon name="arrow_up" /></div>
              </button>
            {:else}
              <div class="dummy" />
            {/if}
          </td>
          <td class="input action down">
            {#if i < items.length - 1}
              <button on:click={() => moveLabeling(i, 1)}>
                <HoverCircle color={'var(--accent-light)'} />
                <div class="icon"><Icon name="arrow_down" /></div>
              </button>
            {:else}
              <div class="dummy" />
            {/if}
          </td>
          <td class="input action down heavy-border">
            <button on:click={() => removeStart(i)}>
              <HoverCircle color={'var(--main-3)'} />
              <div class="icon"><Icon name="delete" /></div>
            </button>
          </td>

          <td class="input code">
            <Input borderless bind:value={item.code} />
          </td>
          <td class="input type">
            <Input borderless bind:value={item.type} />
          </td>
          <td class="input type heavy-border">
            <Input borderless bind:value={item.name} />
          </td>
          <td class="input prepress">
            <Input type="number" borderless min={0} step={0.01} bind:value={item.prepress} />
          </td>
          <td class="input transport">
            <Input type="number" borderless min={0} step={0.01} bind:value={item.transport} />
          </td>
          <td class="input transportThreshold">
            <Input type="number" borderless min={0} step={0.01} bind:value={item.transport_threshold} />
          </td>
          <td class="input margin">
            <Input type="number" borderless min={0} step={0.01} bind:value={item.margin} />
          </td>
          <td class="input minimum heavy-border">
            <Input type="number" borderless min={0} step={0.01} bind:value={item.minimum} />
          </td>

          {#each item.prices as pa}
            <td class="input prices">
              <Input type="number" borderless min={0} step={0.01} bind:value={pa.price} />
            </td>
          {/each}

          <td class="action action-amount action-amount-remove">
            <button on:click={removeAmount}>
              <HoverCircle color={'var(--main)'} />
              <div class="icon"><Icon name="delete" light /></div>
            </button>
          </td>
        </tr>
      {/each}
    </table>
  </div>
{/if}

<div class="edit-actions">
  {#if edited}
    <div class="ui-pair" in:slide={{ delay: 200, duration: 200 }} out:slide={{ duration: 200 }}>
      <Button icon="close" dangerous on:click={() => confirm('Jesteś pewny? Utracisz wszystkie postępy!') && cancel()}>
        Anuluj
      </Button>
      <Button icon="ok" on:click={save}>
        {#if saving}Zapisuję...{:else}Zapisz{/if}
      </Button>
    </div>
  {:else}
    <div in:slide={{ delay: 200, duration: 200 }} out:slide={{ duration: 200 }}>
      <Button icon="add" on:click={addLabeling}>Dodaj</Button>
    </div>
  {/if}
</div>

<div style="display:flex;">
  {#each itemsHTML as html}
    <pre>{@html html}</pre>
  {/each}
</div>

<style>
  .wrapper {
    overflow-x: auto;
    margin-bottom: 0.75rem;
  }
  table {
    table-layout: fixed;
    border-radius: 0;
    width: 1px; /* yes :) this makes the table respect column withds */
  }
  th {
    border-bottom: var(--border-heavy);
    font-weight: normal;
  }
  th.amount:not(.fixed) {
    padding: 0;
  }
  th span.info {
    font-size: 0.85rem;
    opacity: 0.5;
    cursor: help;
  }
  td {
    overflow: hidden;
  }

  .heavy-border {
    border-right: var(--border-heavy);
  }

  .action button {
    overflow: hidden;
    position: relative;
    top: 2px;
    cursor: pointer;
    padding: 0 0.4rem;
    width: 100%;
    height: 100%;
    border: none;
    background-color: var(--light);
  }
  .action-amount {
    border: none;
    padding: 0;
  }
  .action-amount button {
    background-color: var(--primary);
  }
  .action-amount-remove {
    border-top: var(--border-light);
  }
  .action-amount-remove button {
    background-color: var(--primary-dark);
  }

  .edit-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 2rem;
  }

  .icon {
    position: relative;
    height: 100%;
  }
  .dummy {
    width: 100%;
    height: 100%;
    background-color: var(--light);
  }
  .default {
    border-left: var(--outline-dashed);
  }
</style>
