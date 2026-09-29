<script>
  import heimdall from '$/heimdall';
  import { deep, uid } from '%/utils';
  import { tick } from 'svelte';

  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import Button from '@c/Button.svelte';
  import Input from '@c/Input.svelte';
  import Labeling from './Labeling.svelte';
  import { createNewLabeling, getChanged, save, tryCleanItems } from './utils';
  import { ask } from '@/dialog';

  export let unsaved;
  export let saving;

  export let company;
  export let itemsOriginal;
  export let items;

  // anonymous props for tracking changes:
  // _new: true, // whether the item is new (must be tracked since ids are reused)
  // _remove: true, // item marked for deletion
  // _swap: id, // item that will be swapped with this one when deleted

  // the first labeling (in the order of the table) is the company's default; `default` in the database follows it,
  // for whatever reads it (once saved: the loaded rows are marked too, so an old flag isn't an edit)
  $: items && markDefault(items);
  $: itemsOriginal && markDefault(itemsOriginal);
  function markDefault(items) {
    const first = items.filter((item) => !item._remove).sort((a, b) => a.index - b.index)[0];
    for (const item of items) item.default = item === first;
  }

  $: changed = getChanged(items, itemsOriginal);
  $: unsaved = changed.length > 0;

  async function trySave() {
    if (saving) return; // prevent double click
    saving = true;

    const labelingIDs = [];
    const productIDs = [];
    if (await tryCleanItems(items)) {
      for await (const { uid, ids } of save(changed, itemsOriginal)) {
        changed = changed.filter((c) => c._uid !== uid);
        labelingIDs.push(...ids.labelings);
        productIDs.push(...ids.products);
      }
      if (labelingIDs.length) heimdall.emit('labelings', labelingIDs);
      if (productIDs.length) heimdall.emit('products', productIDs);
    }

    saving = false;
  }

  async function cancel() {
    if (await ask('Cofnąć wszystkie niezapisane zmiany?', { ok: 'Cofnij zmiany', danger: true })) {
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

  async function removeAmount(i) {
    if (await ask('Usunąć tę kolumnę?', { ok: 'Usuń', danger: true })) {
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
          <th style:width="2.25rem" class="col-sticky col-remove">
            <span class="head-icon"><Tooltip>Usuwanie</Tooltip><Icon width={15} name="delete" /></span>
          </th>
          <th style:width="3.75rem" class="col-sticky col-index heavy-border">
            <span class="head-icon">
              <Tooltip>Kolejność (pierwsze jest domyślne dla producenta)</Tooltip>
              <Icon width={15} name="arrow_down" />
            </span>
          </th>

          <th style:width="8.75rem">Nazwa</th>
          <th style:width="6.25rem" class="col-sticky col-code">Kod</th>
          <th style:width="6.25rem" class="heavy-border">Typ</th>

          <th style:width="3.75rem">
            <span class="head-icon"><Tooltip>Marża</Tooltip><b style:color="var(--green-700)">M</b></span>
          </th>
          <th style:width="3.75rem">
            <span class="head-icon"><Tooltip>Minimum</Tooltip><b style:color="var(--green-700)">MIN</b></span>
          </th>
          <th style:width="3.75rem">
            <span class="head-icon"><Tooltip>Przygotowalnia</Tooltip><b style:color="var(--blue-700)">P</b></span>
          </th>
          <th style:width="3.75rem">
            <span class="head-icon"><Tooltip>Cena transportu</Tooltip><b style:color="var(--purple-700)">T</b></span>
          </th>
          <th style:width="4.375rem" class="heavy-border">
            <span class="head-icon"
              ><Tooltip>Próg dla uwzględnienia transportu</Tooltip><b style:color="var(--purple-700)">TP</b></span>
          </th>

          {#each items[0].prices as p, i (p._uid)}
            {@const isLumpsum = p.amount == 1}

            <th style:width="5rem" class="amount" class:amount--lumpsum={isLumpsum}>
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
                on:input={(e) => handleAmountInput(e, i)} />
            </th>
          {/each}

          <th style:width="5.625rem" class="add-amount">
            <span class="head-icon"
              ><Button small icon="add" title="Dodaj nakład" on:click={addAmount}>Dodaj</Button></span>
          </th>
          <!-- no width: the rest of the box, so the lines of the rows go all the way (nothing when it scrolls) -->
          <th class="filler" />
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

<!-- adding stays there while there are changes: several can be added before saving -->
<div class="edit-actions">
  {#if !saving}
    <Button icon="add" on:click={addLabeling}>Dodaj</Button>
  {/if}
  {#if unsaved}
    {#if !saving}<span class="divider" />{/if}
    <div class="save">
      {#if !saving}
        <Button icon="close" dangerous on:click={cancel}>Anuluj</Button>
      {/if}
      <Button icon="ok" on:click={trySave}>
        {#if saving}Zapisuję...{:else}Zapisz{/if}
      </Button>
    </div>
    {#each changed as { code, name, type }}
      <small>{code || name || type || '???'}</small>
    {/each}
  {/if}
  {#if company?.api_handling_costs}
    <small class="handling">Koszty manipulacyjne dodawane są automatycznie</small>
  {/if}
</div>
{#if unsaved}
  <div class="edit-info">
    <small>
      <b>Zapisywanie może (bardzo) długo potrwać.</b><br />
      Czas zapisywania zależy od ilości powiązanych produktów.<br />
    </small>
  </div>
{/if}

<style>
  .wrapper {
    overflow: auto;
    max-width: 100%;
    max-height: 70vh;
    margin-bottom: 0.75rem;
    border-radius: var(--box-radius);
    corner-shape: squircle;
    border: var(--border-light);
    background-color: var(--grey-100); /* where the table doesn't reach, to the right of its last column */
  }
  table {
    overflow: auto;
    border-radius: 0;
    table-layout: fixed;
    border: none;
    width: 1px; /* makes the table respect column widths... yes :) */
    min-width: 100%; /* the filler column takes what's left */
  }
  thead {
    position: sticky;
    top: 0;
    z-index: 2;
  }
  .col-sticky {
    position: sticky;
    left: 0;
    z-index: 2;
  }
  /* the first columns stay while the amounts scroll: delete (2.25rem), order (3.75rem), code */
  .col-index {
    left: 2.25rem;
  }
  .col-code {
    left: 6rem;
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
    background-color: var(--grey-100);
    transition: opacity 200ms;
  }
  th.amount--lumpsum:hover .lumpsum {
    pointer-events: none;
    opacity: 0;
  }

  /* between the column groups, in the head and in every row (Labeling) */
  .wrapper :global(.heavy-border) {
    border-right: var(--border-heavy);
  }
  /* the columns of buttons (delete, add an amount) are grey all the way down, like the head, and so is the rest */
  .wrapper :global(.col-remove),
  .wrapper :global(.add-amount),
  .wrapper :global(.filler) {
    background-color: var(--grey-100);
  }
  .wrapper :global(.add-amount) {
    border-right: none; /* one grey area with the filler */
  }

  .head-icon {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  .add-amount {
    padding: 0;
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
    corner-shape: squircle;
    border: var(--border-light);
    padding: 0.25rem;
    background-color: var(--navy-100);
  }
  .amount:hover .amount-actions {
    display: flex;
  }

  /* adding, a line, then cancelling and saving side by side (and what's changed) */
  .edit-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
  }
  .handling {
    margin-left: auto;
  }
  .divider {
    align-self: stretch;
    border-left: var(--border-light);
  }
  .save {
    display: flex;
    gap: 0.5rem;
  }
  .edit-info {
    margin-top: 0.5rem;
  }
</style>
