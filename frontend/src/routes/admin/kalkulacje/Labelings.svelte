<script>
  import api from '$lib/api';
  import socket from '$lib/admin/heimdall';
  import { diff, moveItem } from '$lib/utils';

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
  $: itemsHTMLs = itemsOriginal.map(() => '');

  $: edited = itemsEdited.some(e => e);
  let saving = false;
  let deleting = false;

  let deletingID = null; // id of the labeling that is being deleted
  let swapID = null; // id of the labeling that is being swapped with the one being deleted

  // `default` property is handled separately
  const fieldsToIgnore = ['default', 'user_created', 'date_created', 'user_updated', 'date_updated'];

  function save() {
    if (saving) return;
    saving = true;
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

  function moveLabeling(i, d) {
    items = moveItem(items, i, d);
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
    await recalculateProducts(filter, { swapLabelings: { [deletingID]: swapID } }); // will delete the labeling if swapID is null

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
    updatedIDs.push(...items.findAll(i => i.index >= item.index).map(i => i.id));
    socket.emitChanges('labelings', updatedIDs);

    items = items.filter(i => i.id !== item.id);
    itemsOriginal = itemsOriginal.filter(i => i.id !== item.id);
    removeFinish();
  }

  function pushAmount() {
    const i = amounts.length - 1;
    const amount = i === -1 ? 1 : amounts[i] + 1;
    for (const item of items) {
      item.prices.push({ amount, price: null });
    }
    items = items;
  }
  function removeAmount() {
    const i = amounts.length - 1;
    if (i === -1) return;
    for (const item of items) {
      item.prices.splice(i, 1);
    }
    items = items;
  }

  $: amounts = items.length ? items[0].prices.map(p => p.amount) : [];
  $: for (const [i, itemOriginal] of itemsOriginal.entries()) {
    const item = items.find(i => i.id == itemOriginal.id);
    if (item) {
      diff(item, itemOriginal, fieldsToIgnore).then(({ changed, html }) => {
        itemsEdited[i] = changed;
        itemsHTMLs[i] = html;
      });
    } else itemsEdited[i] = true;
  }
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
      {#if deleting} Usuwanie... {:else} Usuń {/if}
    </Button>
  </div>
</Popup>

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
      <th width="30" class="icon border-heavy">
        <div class="icon"><Icon name="delete" /></div>
      </th>

      <th width="70">Kod</th>
      <th width="70">Typ</th>
      <th width="140" class="border-heavy">Nazwa</th>
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
      <th width="70" title={'Minimum'} class="border-heavy">
        MIN <span class="info">🛈</span>
      </th>

      {#each amounts as amount, i}
        <th width="80" class="amount">
          <Input type="number" borderless min={0} step={0.01} bind:value={amount} />
        </th>
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
        <td class="input action down border-heavy">
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
        <td class="input type border-heavy">
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
        <td class="input minimum border-heavy">
          <Input type="number" borderless min={0} step={0.01} bind:value={item.minimum} />
        </td>

        {#each item.prices as pa, j}
          <td class="input prices" class:border-light={j == amounts.length - 1}>
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

<Button icon="add" borderRadius={0} on:click={addLabeling} />

{#if edited} <b>{edited}</b>{:else} {edited}{/if}

{JSON.stringify(itemsEdited)}
<div class="diffs">
  {#each itemsHTMLs as html}
    <pre>{@html html}</pre>
  {/each}
</div>

<style>
  .diffs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  .wrapper {
    overflow-x: auto;
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
  th.amount {
    padding: 0;
  }
  th span.info {
    font-size: 0.85rem;
    opacity: 0.5;
    cursor: help;
  }

  th.border-heavy,
  td.border-heavy {
    border-right: var(--border-heavy);
  }
  td.border-light {
    border-right: var(--border-light);
  }
  td {
    overflow: hidden;
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
