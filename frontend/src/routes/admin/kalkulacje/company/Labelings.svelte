<script>
  import heimdall from "$/heimdall";
  import { deep, uid } from "%/utils";
  import { tick } from "svelte";

  import HoverCircle from "$c/HoverCircle.svelte";
  import Icon from "$c/Icon.svelte";
  import Tooltip from "$c/Tooltip.svelte";
  import Button from "@c/Button.svelte";
  import Input from "@c/Input.svelte";
  import Labeling from "./Labeling.svelte";
  import { createNewLabeling, getChanged, save, tryCleanItems } from "./utils";

  export let unsaved;

  export let company;
  export let itemsOriginal;
  export let items; // TODO: confusing rerenders happen while saving

  // Items state needs to be tracked for changes. We also need to track if the item is new,
  // whether it will be deleted (and whether it will swapped).
  // The easiest way seems to be to add props (as in _prop) to the objects when "actions" take place,
  // then when saving perform all these actions, and then remove the props after saving.
  // This way checking if there are changes is as simple as checking if the whole array of items is
  // different from the original one, and displaying what will be changed is just going through the array and checking
  // for the props and displaying their "parents".

  // Changing the order of items should be done by writing down the new index for an item (instead of the arrows),
  // then other indexes should be updated accordingly, then the items should be sorted.
  // This way we don't need to track the indexes separately, all will be saved at the end.
  // The problem is with items that will be deleted. They could just be displayed at the end, through INFINITE indexes.

  // Editing the amounts (order of the columns) should happen automatically by sorting them by amount.
  // The "Ryczałt" column is problematic, as it does not allow for editing the amount. But that could be handled
  // by still displaying the text as floating above the input field and hiding it when the user hover over it,
  // thus still allowing the editing.

  // props:
  // _new: false, // whether the item is new (must be tracked since ids are reused)
  // _remove: false, // whether the item will be deleted
  // _swap: id, // item that will be swapped with this one when deleted

  let saving = false;
  let changedOverride = null; // populated when saving to avoid misleading rerenders
  $: changed = getChanged(items, itemsOriginal);
  $: unsaved = changedOverride ? changedOverride.length > 0 : changed.length > 0;

  async function trySave() {
    if (saving) return; // prevent double click
    saving = true;

    const labelingIDs = [];
    const productIDs = [];
    if (tryCleanItems(items)) {
      changedOverride = deep.copy(changed);

      for await (const { uid, ids } of save(changedOverride)) {
        changedOverride = changedOverride.filter((c) => c._uid !== uid);
        labelingIDs.push(...ids.labelings);
        productIDs.push(...ids.products);
      }

      if (labelingIDs.length) heimdall.emit("labelings", labelingIDs);
      if (productIDs.length) heimdall.emit("products", productIDs);

      changedOverride = null;
    }

    items = items;
    saving = false;
  }

  function cancel() {
    if (confirm("Jesteś pewny? Ta akcja jest nieodwracalna.")) {
      items = deep.copy(itemsOriginal);
    }
  }

  async function addLabeling() {
    items = [...items, createNewLabeling(company, items)];
  }

  function addAmount() {
    for (const item of items) {
      item.prices.push({
        _uid: uid(10),
        enabled: false,
        amount: null,
        price: null,
      });
    }
    items = items;
  }

  function removeAmount(i) {
    if (confirm(`Czy na pewno chcesz usunąć tę kolumnę?`)) {
      for (const item of items) {
        item.prices.splice(i, 1);
      }
      items = items;
    }
  }

  function handleAmountClick(e) {
    e.detail.e.target.select();
  }

  async function handleAmountInput(e, i) {
    const input = parseInt(e.detail.e.target.value);
    const amount = isNaN(input) ? null : input < 1 ? 1 : input; // basic validation
    for (const item of items) {
      item.prices[i].amount = amount; // update the amount in each item
    }
    // If two amounts are the same when sorting each item individually, then the order for all items is not guaranteed,
    // so the order must first be determined for one item (the first) and then applied to all of them.
    // First get where to place each item in the array (array of new indexes), then reorder all items by that order.
    const newIndexes = items[0].prices
      .map(({ amount }, i) => ({ amount, i }))
      .sort((a, b) => a.amount - b.amount)
      .map(({ i }) => i);
    for (const item of items) {
      const temp = deep.copy(item.prices);
      item.prices = newIndexes.map((i) => temp[i]);
    }
    items = items;
    await tick();
    e.detail.e.target.focus();
  }
</script>

{#if items.length}
  <div class="wrapper">
    <table class="ui-table">
      <thead>
        <tr>
          <th width="60" class="col-sticky col-index">
            <Tooltip>Kolejność</Tooltip>
            <Icon width="15" name="arrow_down" />
          </th>
          <th width="30">
            <Tooltip>Domyślne dla producenta</Tooltip>
            <Icon width="15" name="star" />
          </th>
          <th width="30" class="heavy-border">
            <Icon width="15" name="delete" />
          </th>

          <th width="140">Nazwa</th>
          <th width="100" class="col-sticky col-code">Kod</th>
          <th width="100" class="heavy-border">Typ</th>

          <th width="60">
            <Tooltip>Marża</Tooltip>
            <b style:color="#0A9f59">M</b>
          </th>
          <th width="60">
            <Tooltip>Minimum</Tooltip>
            <b style:color="#0A9f59">MIN</b>
          </th>
          <th width="60">
            <Tooltip>Przygotowalnia</Tooltip>
            <b style:color="#0089ff">P</b>
          </th>
          <th width="60">
            <Tooltip>Cena transportu</Tooltip>
            <b style:color="#6604C2">T</b>
          </th>
          <th width="70" class="heavy-border">
            <Tooltip>Próg dla uwzględnienia transportu</Tooltip>
            <b style:color="#6604C2">TP</b>
          </th>

          {#each items[0].prices as p, i (p._uid)}
            {@const isLumpsum = p.amount == 1}

            <th width="80" class="amount" class:amount--lumpsum={isLumpsum}>
              <div class="amount-actions">
                <Button icon="delete" on:click={() => removeAmount(i)} square dangerous />
              </div>

              {#if isLumpsum}
                <div class="lumpsum">
                  <small>Ryczałt</small>
                </div>
              {/if}

              <Input
                type="number"
                borderless
                min={0}
                step={1}
                value={p.amount}
                on:click={handleAmountClick}
                on:input={(e) => handleAmountInput(e, i)}
              />
            </th>
          {/each}

          <th width="30" rowspan={items.length + 1} class="action action-amount-push">
            <button on:click={() => addAmount()}>
              <HoverCircle />
              <div class="icon"><Icon fill name="add" light /></div>
            </button>
          </th>
        </tr>
      </thead>

      <tbody>
        {#each items as item, i (item._uid)}
          <Labeling bind:items bind:item index={i} />
        {/each}
      </tbody>
    </table>
  </div>
{/if}

{#if unsaved}
  <div class="edit-actions">
    <div class:ui-pair={!saving}>
      {#if !saving}
        <Button icon="close" dangerous on:click={cancel}>Anuluj</Button>
      {/if}
      <Button icon="ok" on:click={trySave}>
        {#if saving}Zapisuję...{:else}Zapisz{/if}
      </Button>
    </div>
    {#each changedOverride ? changedOverride : changed as { code, name, type }}
      <small>{code || name || type || "???"}</small>
    {/each}
  </div>
  <div class="edit-info">
    <small>
      <b>Zapisywanie może (bardzo) długo potrwać.</b><br />
      Czas zapisywania zależy od ilości powiązanych produktów.<br />
      Podczas zapisywania dane w tabeli mogą ulegać zmianom.
    </small>
  </div>
{:else}
  <Button icon="add" on:click={addLabeling}>Dodaj</Button>
{/if}

<style>
  .wrapper {
    overflow: auto;
    max-width: 100%;
    max-height: 70vh;
    margin-bottom: 0.75rem;
    border: var(--border-light);
  }
  table {
    overflow: auto;
    border-radius: 0;
    table-layout: fixed;
    border: none;
    width: 1px; /* makes the table respect column widths... yes :) */
  }
  thead {
    position: sticky;
    /* top: 4rem; */
    top: 0;
    z-index: 2;
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
  th {
    border-bottom: var(--border-heavy);
    font-weight: normal;
    white-space: nowrap;
  }

  th.amount {
    padding: 0;
  }
  th.amount--lumpsum {
    position: relative;
  }
  .lumpsum {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
    padding-top: 0.4rem;
    padding-left: 0.45rem;
    width: 100%;
    height: 100%;
    background-color: var(--accent-white);
    transition: opacity 200ms;
  }
  th.amount--lumpsum:hover .lumpsum {
    pointer-events: none;
    opacity: 0;
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
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
  }
  .edit-info {
    margin-top: 0.5rem;
  }

  .icon {
    position: relative;
    height: 100%;
  }
</style>
