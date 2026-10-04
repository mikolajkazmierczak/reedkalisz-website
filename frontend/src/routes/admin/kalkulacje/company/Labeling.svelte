<script>
  import { tick } from 'svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Modal from '@c/Modal.svelte';
  import { reindex } from './utils';

  export let items;
  export let item;
  export let original = null; // the row as saved (none for a new one: all of it is new)
  export let index; // index in the items array, not the `index` property

  // a cell changed since the last save, marked (all of a new row's, and of a new column's)
  const differs = (value, saved) => String(value ?? '') !== String(saved ?? '');
  $: changed = (field) => !original || differs(item[field], original[field]);
  $: priceChanged = (p) => {
    const saved = original?.prices.find((o) => o._uid === p._uid);
    return !saved || differs(p.price, saved.price);
  };

  let removing = false;
  let swapID = null;

  // saved ones that stay: not this one, not new ones (no id yet), not ones going too
  $: swapOptions = [
    { id: null, text: 'Bez zamiennika', special: true },
    ...items
      .filter((l) => l.id != null && l.id !== item.id && !l._remove)
      .map(({ id, name, code, type }) => ({ id, text: code || name || type || '???' })),
  ];

  async function handleIndexInput(e) {
    // Validate the input (setting the index to 0 if incorrect) and fixes the new order.
    const input = parseInt(e.detail.e.target.value);
    const itemIndex = isNaN(input) || input < 0 ? 0 : input; // item property (with basic validation)
    const orderIndex = itemIndex + items.filter((i) => i.index === -1).length; // order in the array (with removing items)
    items.splice(index, 1); // remove the item from the array
    items.splice(orderIndex, 0, { ...item, index: itemIndex }); // insert at the new index
    items = reindex(items);
    await tick();
    e.detail.e.target.focus();
  }

  function tryRemove() {
    if (removing) return; // prevent double click
    removing = true;
  }

  function removeCancel() {
    removing = false;
  }

  function remove() {
    if (item._new) {
      items = reindex(items.filter((i) => i._uid !== item._uid)); // not saved yet: nothing to delete, it just goes
    } else {
      item._remove = true;
      item._swap = swapID;
      items = reindex(items); // the first one left becomes the default (see Labelings)
    }
    removing = false;
  }
</script>

{#if removing}
  <Modal title="Zaznaczyć do usunięcia?" maxWidth="24rem" on:close={removeCancel}>
    <small>
      Przy zapisywaniu znakowanie zostanie usunięte w produktach, które z niego korzystają. Możesz też wybrać zamiennik.
    </small>

    <Input type="select" bind:value={swapID} options={swapOptions}>Zamiennik</Input>
    <div class="ui-pair">
      <Button icon="close" secondary edge on:click={removeCancel}>Anuluj</Button>
      <Button dangerous on:click={remove}>Usuń</Button>
    </div>
  </Modal>
{/if}

<tr class:remove={item._remove}>
  <td class="col-sticky col-remove">
    <span class="cell-button"><Button size="sm" dangerous icon="delete" title="Usuń" on:click={tryRemove} /></span>
  </td>
  <td class="input type col-sticky col-index heavy-border" class:changed={changed('index')}>
    <Input type="number" borderless min={0} step={1} value={item.index} on:input={handleIndexInput} />
  </td>

  <td class="input type" class:changed={changed('name')}>
    <Input borderless bind:value={item.name} />
  </td>
  <td class="input code col-sticky col-code" class:changed={changed('code')}>
    <Input borderless bind:value={item.code} />
  </td>
  <td class="input type heavy-border" class:changed={changed('type')}>
    <Input borderless bind:value={item.type} />
  </td>

  <td class="input margin" class:changed={changed('margin')}>
    <Input type="number" borderless min={0} step={0.01} bind:value={item.margin} />
  </td>
  <td class="input minimum" class:changed={changed('minimum')}>
    <Input type="number" borderless min={0} step={0.01} bind:value={item.minimum} />
  </td>
  <td class="input prepress" class:changed={changed('prepress')}>
    <Input type="number" borderless min={0} step={0.01} bind:value={item.prepress} />
  </td>
  <td class="input transport" class:changed={changed('transport')}>
    <Input type="number" borderless min={0} step={0.01} bind:value={item.transport} />
  </td>
  <td class="input transportThreshold heavy-border" class:changed={changed('transport_threshold')}>
    <Input type="number" borderless min={0} step={0.01} bind:value={item.transport_threshold} />
  </td>

  {#each item.prices as p (p._uid)}
    <td class="input prices" class:changed={priceChanged(p)}>
      <Input type="number" borderless min={0} step={0.01} bind:value={p.price} />
    </td>
  {/each}
  <!-- under the head's "add an amount": the column goes all the way down -->
  <td class="add-amount" />
  <td class="filler" />
</tr>

<style>
  .remove {
    opacity: 0.3;
  }

  .col-sticky {
    position: sticky;
    left: 0;
    z-index: 1;
  }
  .col-index {
    left: 2.25rem;
  }
  .col-code {
    left: 6rem;
  }
  .cell-button {
    display: flex;
    justify-content: center;
  }
</style>
