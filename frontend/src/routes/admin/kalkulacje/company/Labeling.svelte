<script>
  import { tick } from 'svelte';
  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import HoverCircle from '$c/HoverCircle.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Popup from '@c/Popup.svelte';
  import { reindex } from './utils';

  export let items;
  export let item;
  export let index; // index in the items array, not the `index` property

  let removing = false;
  let swapID = null;

  $: removingIDs = items.filter(item => item._remove).map(item => item.id);

  $: swappable = items.filter(({ id }) => !removingIDs.includes(id));
  $: swapOptions = [
    { id: null, text: 'Bez zamiennika' },
    ...swappable.map(({ id, name, code, type }) => ({ id, text: code || name || type || '???' }))
  ];

  function setDefault(i) {
    const old = items.find(old => old.default);
    if (old) old.default = false;
    if (items.length > 0) {
      items[i].default = true;
    }
    items = items;
  }

  function handleIndexClick(e) {
    e.detail.e.target.select();
  }

  async function handleIndexInput(e) {
    // Validate the input (setting the index to 0 if incorrect) and fixes the new order.
    const input = parseInt(e.detail.e.target.value);
    const itemIndex = isNaN(input) || input < 0 ? 0 : input; // item property (with basic validation)
    const orderIndex = itemIndex + items.filter(i => i.index === -1).length; // order in the array (with removing items)
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
    item._remove = true;
    item._swap = swapID;
    reindex(items);
    setDefault(0); // set new default if possible
    removing = false;
  }
</script>

<Popup title="Zaznaczyć do usunięcia?" maxWidth={'300px'} bind:opened={removing} on:close={removeCancel}>
  <small>
    Przy zapisywaniu znakowanie zostanie usunięte w produktach, które z niego korzystają. Możesz też wybrać zamiennik.
  </small>

  <Input type="select" bind:value={swapID} options={swapOptions}>Zamiennik</Input>

  <div class="ui-pair popup-actions">
    <Button on:click={removeCancel}>Anuluj</Button>
    <Button on:click={remove} dangerous>Usuń</Button>
  </div>
</Popup>

<tr class:remove={item._remove}>
  <th class="input type col-sticky col-index">
    <Input
      type="number"
      borderless
      min={0}
      step={1}
      value={item.index}
      on:click={handleIndexClick}
      on:input={handleIndexInput}
    />
  </th>

  <td class="input action default" class:default={item.default}>
    {#if !item.default}
      <button on:click={() => setDefault(index)}>
        <HoverCircle color={'var(--accent-light)'} />
        <div class="icon"><Icon fill name="star" /></div>
      </button>
    {:else}
      <Tooltip>Domyślne</Tooltip>
      <div class="dummy" />
    {/if}
  </td>
  <td class="input action down heavy-border">
    <button on:click={tryRemove}>
      <HoverCircle color={'var(--main-3)'} />
      <div class="icon"><Icon fill name="delete" /></div>
    </button>
  </td>

  <td class="input type">
    <Input borderless bind:value={item.name} />
  </td>
  <td class="input code col-sticky col-code">
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

  {#each item.prices as p (p._uid)}
    <td class="input prices">
      <Input type="number" borderless min={0} step={0.01} bind:value={p.price} />
    </td>
  {/each}
</tr>

<style>
  .remove {
    opacity: 0.3;
  }

  .col-sticky {
    position: sticky;
    /* left: 4rem; */
    left: 0;
    z-index: 1;
  }
  .col-code {
    /* left: calc(4rem + 60px); */
    left: 60px;
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
  .default {
    border-left: var(--outline-dashed);
  }
  .dummy {
    width: 100%;
    height: 100%;
    background-color: var(--light);
  }

  .icon {
    position: relative;
    height: 100%;
  }
</style>
