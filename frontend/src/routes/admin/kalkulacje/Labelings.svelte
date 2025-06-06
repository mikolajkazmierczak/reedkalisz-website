<script>
  import { beforeNavigate } from '$app/navigation';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { deep, diff, moveItem, reuseIDs } from '%/utils';
  import { recalculateProducts } from '@/calculations';

  import { read as fields, defaults } from '%/fields/labelings';
  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import HoverCircle from '$c/HoverCircle.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Popup from '@c/Popup.svelte';

  export let company;
  export let items;
  let itemsOriginal = deep.copy(items);
  // let itemsDiff = items.map(() => '');

  let unsavedItems = itemsOriginal.map(() => false);
  $: unsaved = unsavedItems.some(e => e);

  let saving = false;
  let deleting = false;
  let deletingSaving = false; // prevent double click

  let deletingID = null; // id of the labeling that is being deleted
  let swapID = null; // id of the labeling that is being swapped with the one being deleted

  // `default` and `index` properties are handled separately
  const fieldsToIgnore = ['default', 'index', 'user_created', 'date_created', 'user_updated', 'date_updated'];

  beforeNavigate(navigation => {
    if (unsaved) {
      const prompt = `Zmiany w znakowaniach nie zostały zapisane. Czy na pewno chcesz opuścić stronę?`;
      if (confirm(prompt)) {
        cancel();
      } else navigation.cancel();
    }
  });

  async function save() {
    const updatedIDs = [];
    const updatedItems = new Map();
    for (const [i, item] of items.entries()) {
      if (unsavedItems[i]) {
        const data = deep.copy(item);
        // cleanup update data
        delete data.id;
        for (const field of fieldsToIgnore) delete data[field];
        for (const price of data.prices) price.enabled = false;
        // sort amounts and ids
        data.prices.sort((a, b) => a.amount - b.amount); // sort prices by amounts
        const reusableIDs = data.prices.map(p => p.id);
        reuseIDs(data.prices, reusableIDs);

        // UPDATE LABELING
        const updatedItem = await api.items('labelings').updateOne(item.id, data, { fields });
        updatedIDs.push(updatedItem.id);
        updatedItems.set(i, updatedItem);

        // UPDATE AFFECTED PRODUCTS
        const filter = { labelings: { labeling: { _eq: item.id } } };
        await recalculateProducts(filter);

        unsavedItems[i] = false;
      }
    }
    // refresh items
    for (const [i, item] of updatedItems) items[i] = item;
    itemsOriginal = deep.copy(items);
    heimdall.emit('labelings', updatedIDs);
  }
  function tryRemoveDuplicateAmounts() {
    // check if there are duplicate amounts, ask the user if he wants to continue, only keep the first occurences
    const amountsCopy = [];
    const amountsDuplicates = [];
    const amountsDuplicatesIndexes = [];
    for (const [i, a] of amounts.entries()) {
      if (amountsCopy.includes(a)) {
        amountsDuplicates.push(a);
        amountsDuplicatesIndexes.push(i);
      } else amountsCopy.push(a);
    }
    if (amountsDuplicates.length) {
      let prompt = `W nakładach powtarzają się kwoty: "${amountsDuplicates.join(', ')}".`;
      prompt += ` Jeśli kontynuujesz zostaną zachowane tylko pierwsze wystąpienia.`;
      if (confirm(prompt)) {
        // only keep first occurences
        for (const item of items) item.prices = item.prices.filter((_, i) => !amountsDuplicatesIndexes.includes(i));
      } else return false;
    } else return true;
  }
  function tryRemoveEmptyAmounts() {
    // check if there are columns without amounts
    if (items.some(item => item.prices.some(p => !p.amount))) {
      if (confirm('Niektóre kolumny nie mają ustalonych nakładów. Jeśli kontynuujesz zostaną usunięte.')) {
        for (const item of items) item.prices = item.prices.filter(p => p.amount);
      } else return false;
    } else return true;
  }
  async function saveStart() {
    if (saving) return;
    saving = true;
    let continueSaving = true;
    continueSaving = tryRemoveEmptyAmounts();
    continueSaving = tryRemoveDuplicateAmounts();
    if (continueSaving) await save();
    saving = false;
  }
  function cancel() {
    items = deep.copy(itemsOriginal);
    unsaved = false;
  }

  function newLabeling() {
    const data = defaults();
    data.company = company.id;
    data.index = items.length;
    for (const amount of amounts) {
      data.prices.push({ amount, price: null });
    }
    if (amounts.length == 0) {
      data.default = true;
      data.prices.push({ amount: 1, price: null }); // lumpsum is mandatory
    }
    delete data.id;
    return data;
  }
  async function addLabeling() {
    // save to api immediately to get id
    const data = newLabeling();
    const item = await api.items('labelings').createOne(data, { fields });
    heimdall.emit('labelings', item.id);
    items = [...items, item];
    itemsOriginal = [...itemsOriginal, deep.copy(item)];
  }

  async function setDefault(i) {
    const item = items[i];
    const oldDefault = items.find(i => i.default);
    item.default = true;
    oldDefault.default = false;
    await api.items('labelings').updateOne(item.id, { default: true });
    await api.items('labelings').updateOne(oldDefault.id, { default: false });
    heimdall.emit('labelings', [item.id, oldDefault.id]);
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

    // TODO: items are refreshing on the page back to old sorting
    itemsOriginal = deep.copy(items);
    heimdall.emit('labelings', ids);
    location.reload();
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
    heimdall.emit('labelings', updatedIDs);

    items = items.filter(i => i.id !== item.id);
    itemsOriginal = itemsOriginal.filter(i => i.id !== item.id);

    deletingSaving = false;
    removeFinish();
  }

  function pushAmount(i = null) {
    if (i === null) i = amounts.length;
    for (const item of items) {
      item.prices.splice(i, 0, { amount: null, price: null });
    }
    items = items;
    amounts.splice(i, 0, null);
    amounts = amounts;
  }
  function removeAmount(i) {
    if (confirm(`Czy na pewno chcesz usunąć tą kolumnę?`)) {
      for (const item of items) {
        item.prices.splice(i, 1);
      }
      items = items;
      amounts.splice(i, 1);
      amounts = amounts;
    }
  }
  function moveAmount(i, d) {
    // d = 1 or -1
    // switch amounts places
    [amounts[i], amounts[i + d]] = [amounts[i + d], amounts[i]];
    amounts = amounts;
    // switch prices places
    for (const item of items) {
      const temp = item.prices[i];
      item.prices[i] = item.prices[i + d];
      item.prices[i + d] = temp;
    }
    items = items;
  }

  function updatePricesFromAmounts(amounts) {
    for (const [i, amount] of amounts.entries()) {
      for (const item of items) {
        item.prices[i].amount = amount;
      }
    }
    items = items;
  }
  function updateAmountsFromPrices(items) {
    if (deep.same(items, itemsOriginal)) {
      amounts = items.length ? items[0].prices.map(p => p.amount) : [];
    }
  }

  function checkDiff(items) {
    for (const [i, itemOriginal] of itemsOriginal.entries()) {
      const item = items.find(i => i.id == itemOriginal.id);
      diff(item, itemOriginal, { fieldsToIgnore }).then(({ changed, html }) => {
        unsavedItems[i] = changed;
        // itemsDiff[i] = html;
      });
    }
  }

  let amounts = [];
  $: updatePricesFromAmounts(amounts);
  $: updateAmountsFromPrices(items);

  $: checkDiff(items);
</script>

<Popup
  title="Jesteś pewny, że chcesz usunąć to znakowanie?"
  maxWidth={'300px'}
  bind:opened={deleting}
  on:close={removeFinish}
>
  <small>Znakowanie zostanie usunięte w produktach, które z niego korzystają. Możesz wybrać zamiennik.</small>
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
      {#if deletingSaving}
        Usuwanie...
      {:else}
        Usuń
      {/if}
    </Button>
  </div>
</Popup>

{#if items.length}
  <div class="wrapper">
    <table class="ui-table">
      <tr>
        <th width="30">
          <Tooltip>Domyślne dla producenta</Tooltip>
          <Icon fill name="star" />
        </th>
        <!-- <th width="30">
          <Icon fill name="arrow_up" />
        </th>
        <th width="30">
          <Icon fill name="arrow_down" />
        </th> -->
        <th width="30" class="heavy-border">
          <Icon fill name="delete" />
        </th>

        <th width="140">Nazwa</th>
        <th width="70">Kod</th>
        <th width="70" class="heavy-border">Typ</th>

        <th width="70">
          <Tooltip>Marża</Tooltip>
          <b style:color="#0A9f59">M</b>
        </th>
        <th width="70">
          <Tooltip>Minimum</Tooltip>
          <b style:color="#0A9f59">MIN</b>
        </th>
        <th width="70">
          <Tooltip>Przygotowalnia</Tooltip>
          <b style:color="#0089ff">P</b>
        </th>
        <th width="70">
          <Tooltip>Cena transportu</Tooltip>
          <b style:color="#6604C2">T</b>
        </th>
        <th width="70" class="heavy-border">
          <Tooltip>Próg dla uwzględnienia transportu</Tooltip>
          <b style:color="#6604C2">TP</b>
        </th>

        {#each amounts as amount, i}
          {@const firstLumpsumIndex = amounts.map((a, i) => (a == 1 ? i : null)).filter(i => i !== null)[0]}
          <th width="80" class="amount" class:fixed={i == firstLumpsumIndex}>
            <div class="amount-actions">
              {#if !i == 0}
                <Button icon="arrow_left" on:click={() => moveAmount(i, -1)} square />
              {/if}
              {#if i < amounts.length - 1}
                <Button icon="arrow_right" on:click={() => moveAmount(i, 1)} square />
              {/if}
              <Button icon="delete" on:click={() => removeAmount(i)} square dangerous />
              <Button icon="add" on:click={() => pushAmount(i + 1)} square />
            </div>
            {#if i == firstLumpsumIndex}
              <small>Ryczałt</small>
            {:else}
              <Input type="number" borderless min={0} step={1} bind:value={amount} />
            {/if}
          </th>
        {/each}

        <th width="30" rowspan={items.length + 1} class="action action-amount-push">
          <button on:click={() => pushAmount()}>
            <HoverCircle />
            <div class="icon"><Icon fill name="add" light /></div>
          </button>
        </th>
      </tr>

      {#each items as item, i}
        <tr>
          <td class="input action default" class:default={item.default}>
            {#if !item.default}
              <button on:click={() => setDefault(i)}>
                <HoverCircle color={'var(--accent-light)'} />
                <div class="icon"><Icon fill name="star" /></div>
              </button>
            {:else}
              <Tooltip>Domyślne dla producenta</Tooltip>
              <div class="dummy" />
            {/if}
          </td>
          <!-- <td class="input action up">
            {#if !i == 0}
              <button on:click={() => moveLabeling(i, -1)}>
                <HoverCircle color={'var(--accent-light)'} />
                <div class="icon"><Icon fill name="arrow_up" /></div>
              </button>
            {:else}
              <div class="dummy" />
            {/if}
          </td>
          <td class="input action down">
            {#if i < items.length - 1}
              <button on:click={() => moveLabeling(i, 1)}>
                <HoverCircle color={'var(--accent-light)'} />
                <div class="icon"><Icon fill name="arrow_down" /></div>
              </button>
            {:else}
              <div class="dummy" />
            {/if}
          </td> -->
          <td class="input action down heavy-border">
            <button on:click={() => removeStart(i)}>
              <HoverCircle color={'var(--main-3)'} />
              <div class="icon"><Icon fill name="delete" /></div>
            </button>
          </td>

          <td class="input type">
            <Input borderless bind:value={item.name} />
          </td>
          <td class="input code">
            <Input borderless bind:value={item.code} />
          </td>
          <td class="input type heavy-border">
            <Input borderless bind:value={item.type} />
          </td>

          <td class="input margin">
            <Input type="number" borderless min={0} step={0.01} bind:value={item.margin} />
          </td>
          <td class="input minimum">
            <Input type="number" borderless min={0} step={0.01} bind:value={item.minimum} />
          </td>
          <td class="input prepress">
            <Input type="number" borderless min={0} step={0.01} bind:value={item.prepress} />
          </td>
          <td class="input transport">
            <Input type="number" borderless min={0} step={0.01} bind:value={item.transport} />
          </td>
          <td class="input transportThreshold heavy-border">
            <Input type="number" borderless min={0} step={0.01} bind:value={item.transport_threshold} />
          </td>

          {#each item.prices as pa}
            <td class="input prices">
              <Input type="number" borderless min={0} step={0.01} bind:value={pa.price} />
            </td>
          {/each}

          <!-- <td class="action action-amount action-amount-remove">
              <button on:click={removeAmount}>
                <HoverCircle color={'var(--main)'} />
                <Icon fill name="delete" light />
              </button>
            </td> -->
        </tr>
      {/each}
    </table>
  </div>
{/if}

<div class="edit-actions">
  {#if unsaved}
    <div class="ui-pair">
      <Button icon="close" dangerous on:click={() => confirm('Jesteś pewny? Utracisz wszystkie postępy!') && cancel()}>
        Anuluj
      </Button>
      <Button icon="ok" on:click={saveStart}>
        {#if saving}Zapisuję...{:else}Zapisz{/if}
      </Button>
    </div>
    {#each unsavedItems as value, i}
      {#if value == true}
        <small>{items[i].code ?? '-'} {items[i].type ?? '-'} {items[i].name ?? '-'}</small>
      {/if}
    {/each}
  {:else}
    <div>
      <Button icon="add" on:click={addLabeling}>Dodaj</Button>
    </div>
  {/if}
</div>

<!-- <div style="display:flex;">
  {#each itemsDiff as item}
    <pre style="width:200px;">{@html item}</pre>
  {/each}
</div> -->

<style>
  .wrapper {
    overflow-x: auto;
    margin-bottom: 0.75rem;
  }
  table {
    /* overflow: auto; */
    /* position: relative; */
    table-layout: fixed;
    border-radius: 0;
    width: 1px; /* yes :) this makes the table respect column withds */
  }
  /* thead tr:nth-child(1) th {
    position: sticky;
    top: 4rem;
    z-index: 1;
  } */
  th {
    border-bottom: var(--border-heavy);
    font-weight: normal;
    white-space: nowrap;
  }
  th.amount:not(.fixed) {
    padding: 0;
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
  .action-amount-push {
    border: none;
    padding: 0;
  }
  .action-amount-push button {
    background-color: var(--primary);
  }

  .amount {
    position: relative;
  }
  .amount-actions {
    z-index: 1;
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translate(-50%, 100%);
    display: none;
    justify-content: center;
    gap: 0.25rem;
    border-radius: var(--border-radius);
    border: var(--border-light);
    padding: 0.25rem;
    background-color: var(--primary-white);
  }
  .amount:hover .amount-actions {
    display: flex;
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
