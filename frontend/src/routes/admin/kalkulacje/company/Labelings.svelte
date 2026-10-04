<script>
  import heimdall from '$/heimdall';
  import { deep, uid } from '%/utils';
  import { tick } from 'svelte';

  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import Button from '@c/Button.svelte';
  import Input from '@c/Input.svelte';
  import Labeling from './Labeling.svelte';
  import { gridKeys } from './gridKeys';
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

  // the labelings to be saved, named on as many labels as fit in two rows under the table (a new column changes every
  // one), the rest counted on the last - and named in its tooltip, seven to a line. Worked out from the page: all of
  // them laid out, then as many as the first two rows take, then fewer while the count doesn't fit after them
  let list;
  let shown = Infinity;
  let fitting = 0;
  const tops = () => [...new Set([...list.children].map((li) => li.offsetTop))].sort((a, b) => a - b);
  let single = false; // all of them in one row: bigger, in the middle of the buttons' row
  async function fit() {
    const run = ++fitting;
    shown = Infinity;
    single = false;
    await tick();
    if (run !== fitting || !list) return;
    const rows = tops();
    if (rows.length === 1) {
      single = true;
      await tick();
      if (run === fitting && list && tops().length > 1) single = false; // (bigger, they'd take two rows: small ones then)
      return;
    }
    if (rows.length <= 2) return;
    shown = Math.max(0, [...list.children].findIndex((li) => li.offsetTop === rows[2]) - 1);
    await tick();
    while (run === fitting && shown > 0 && tops().length > 2) {
      shown--;
      await tick();
    }
  }
  // (only when what the labels say changes, not on every keystroke in a row already changed)
  $: changedLabels = changed.map(label).join('\n');
  $: list && changedLabels && fit();
  const watchWidth = (node) => {
    const resizes = new ResizeObserver(() => fit());
    resizes.observe(node);
    return { destroy: () => resizes.disconnect() };
  };
  const label = ({ code, name, type }) => code || name || type || '???';
  const lines = (rest) => Array.from({ length: Math.ceil(rest.length / 7) }, (_, i) => rest.slice(i * 7, i * 7 + 7));
  $: unsaved = changed.length > 0;
  // an amount changed since the last save, marked as the rows' cells are (a new column all of it, as a new row): the
  // head's amounts are every row's, so marked against a saved row's, column by column (each row's prices have their
  // own uids, and the first row isn't always the same one)
  $: savedRow = items.find((item) => !item._new);
  $: savedOriginal = savedRow && itemsOriginal.find((o) => o._uid === savedRow._uid);
  $: amountChanged = (i) => {
    const p = savedRow?.prices[i];
    const saved = p && savedOriginal?.prices.find((o) => o._uid === p._uid);
    return !saved || saved.amount !== p.amount;
  };

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
  <div class="slot ui-fill-scroll ui-snap">
    <div class="wrapper">
      <table class="ui-table" use:gridKeys>
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

              <th style:width="5rem" class="amount" class:amount--lumpsum={isLumpsum} class:changed={amountChanged(i)}>
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
                  on:input={(e) => handleAmountInput(e, i)} />
              </th>
            {/each}

            <!-- as wide as the deleting column -->
            <!-- (the right arrow past a row's last field lands on its button, see gridKeys) -->
            <th style:width="2.25rem" class="add-amount" data-grid-end>
              <span class="head-icon"
                ><Button size="sm" dashed icon="add" title="Dodaj nakład" on:click={addAmount} /></span>
            </th>
            <!-- no width: the rest of the box, so the lines of the rows go all the way (nothing when it scrolls) -->
            <th class="filler" />
          </tr>
        </thead>

        <tbody>
          {#each items as item, i (item._uid)}
            <Labeling bind:items bind:item original={itemsOriginal.find((o) => o._uid === item._uid)} index={i} />
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}

<!-- adding stays there while there are changes: several can be added before saving; what's to be saved after the
     buttons, each on a small label - all of it on the page's bottom line -->
<div class="edit-actions ui-snap">
  {#if !saving}
    <Button icon="add" on:click={addLabeling}>Dodaj</Button>
  {/if}
  {#if unsaved}
    {#if !saving}
      <span class="ui-divider" />
      <Button icon="close" secondary edge on:click={cancel}>Anuluj</Button>
    {/if}
    <Button icon="ok" on:click={trySave}>
      {#if saving}Zapisuję...{:else}Zapisz{/if}
    </Button>
    <ul class="changed-list" class:single aria-label="Do zapisania" bind:this={list} use:watchWidth>
      {#each changed.slice(0, shown) as item (item._uid)}
        <li>{label(item)}</li>
      {/each}
      {#if changed.length > shown}
        <li class="more">
          +{changed.length - shown}
          <Tooltip>
            <small>
              {#each lines(changed.slice(shown).map(label)) as line, i}{#if i}<br />{/if}{line.join(', ')}{/each}
            </small>
          </Tooltip>
        </li>
      {/if}
    </ul>
  {/if}
  {#if unsaved || company?.api_handling_costs}
    <div class="notes">
      {#if unsaved}
        <small><b>Zapisywanie może długo potrwać.</b></small>
        <small>Czas zapisywania zależy od ilości powiązanych produktów.</small>
      {/if}
      {#if company?.api_handling_costs}
        <small>Koszty manipulacyjne dodawane są automatycznie</small>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* the table's place on the mat: what the page gives it (see .ui-fill), whole half cells (.ui-snap) - a short table
     ends at its last row, the rest of its place left bare under it */
  .slot {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    margin-bottom: var(--page-pad);
  }
  /* scrolls both ways once the table outgrows its place; its head and first columns stay (a field reached by the keys
     not under them: scroll-padding) */
  .wrapper {
    flex: 0 1 auto;
    min-height: 0;
    overflow: auto;
    scroll-padding: 2.5rem 0 0 12.25rem;
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

  /* an amount is typed in: white, as a row's fields (only the lump sum's label over it grey) */
  th.amount {
    padding: 0;
    background-color: var(--paper-field);
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
  th.amount--lumpsum:hover .lumpsum,
  th.amount--lumpsum:focus-within .lumpsum {
    pointer-events: none;
    opacity: 0;
  }

  /* between the column groups, in the head and in every row (Labeling) */
  .wrapper :global(.heavy-border) {
    border-right: var(--border-heavy);
  }
  /* the fields take the row's colour (white, a shade darker under the pointer); the columns that stay take it too,
     opaque, so what scrolls under them doesn't show through their lines */
  .wrapper :global(input.borderless) {
    background-color: transparent;
  }
  .wrapper :global(td.col-sticky:not(.col-remove)) {
    background-color: inherit;
  }
  /* changed since the last save: faintly yellow, as a copy to be filed - over the cell's own colour, so the columns
     that stay keep theirs opaque */
  .wrapper :global(td.changed),
  .wrapper :global(th.changed) {
    --mark: linear-gradient(rgb(from var(--yellow-100) r g b / 0.5), rgb(from var(--yellow-100) r g b / 0.5));
    background-image: var(--mark);
  }
  /* under the pointer a shade darker too, as the row */
  .wrapper :global(tr:hover td.changed) {
    background-image: linear-gradient(var(--black-6), var(--black-6)), var(--mark);
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

  /* adding, a line, cancelling and saving, what's to be saved, the notes at the other end - a cell and a half on the
     mat, all of it resting on the page's bottom line */
  .edit-actions {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    height: calc(3 * var(--half) - 1px);
  }
  .edit-actions > :global(.ui-divider) {
    align-self: flex-end;
  }
  /* each labeling to be saved on a small label, yellow as its changed cells: two rows of them, from the bottom up (see
     fit), the two and the gap between them as tall as a button beside them (16 + 3 + 16 = 35px: off the mat's steps,
     on purpose) */
  .changed-list {
    position: relative; /* (the labels' offsetTop) */
    flex: 1;
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-end;
    gap: 3px 0.25rem;
    height: var(--control);
    overflow: hidden;
    margin: 0 0 0 0.5rem;
    padding: 0;
    list-style: none;
  }
  .changed-list li {
    display: flex;
    align-items: center;
    height: 16px;
    padding: 0 0.35rem;
    border: var(--border-light);
    border-radius: var(--field-radius-compact);
    corner-shape: squircle;
    background-color: color-mix(in srgb, var(--yellow-100) 50%, var(--paper));
    box-shadow: var(--shadow);
    font-size: 0.7rem;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
  }
  /* one row: as tall as a small button, in the middle of the row */
  .changed-list.single {
    align-content: center;
  }
  .changed-list.single li {
    height: 1.5rem;
    padding: 0 0.5rem;
    border-radius: var(--field-radius-small);
    font-size: 0.8rem;
  }
  /* the count of the rest: the labels' yellow as its edge, clear inside */
  .changed-list li.more {
    cursor: help;
    border-color: color-mix(in srgb, var(--yellow-100) 70%, var(--orange-300));
    box-shadow: none;
    background-color: transparent;
    color: var(--text);
  }
  .notes {
    flex: none;
    display: flex;
    flex-direction: column;
    margin-left: auto;
    text-align: right;
    line-height: 1.15;
  }
</style>
