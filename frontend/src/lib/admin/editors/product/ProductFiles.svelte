<script>
  import { createEventDispatcher } from 'svelte';
  import { sortable, moveTo } from '@/sortable';
  import { beside } from '@/beside';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import DragHandle from '@c/DragHandle.svelte';
  import MoveTo from '@c/MoveTo.svelte';
  import Picker from '@c/library/Picker.svelte';
  import { GALLERY } from './order.js';

  // A product's files in a row of boxes, each picked from the library, dragged into place by its handle or taken
  // away: its gallery (`main`: the first image is the main one; no hiding a photo, one that shouldn't show goes)
  // and its attachments (downloaded from its page, each can be turned off). The gallery's images can be moved to a
  // variant (`targets`, see order.js): `on:move` { from, index, to }.
  export let title;
  export let items; // rows with the file in `key`, `enabled`
  export let key = 'img';
  export let main = false;
  export let fileContext = null; // { used, history } file ids, for the picker
  export let targets = null;
  export let covers = []; // the rows of the site's tiles' picture and the one under the pointer (see Product)
  const dispatch = createEventDispatcher();

  // in the order shown (`index`: they're read back sorted by it)
  function push() {
    items = [...items, { [key]: null, enabled: true, index: items.length, ...(main && { main: false }) }];
  }
  function remove(i) {
    items.splice(i, 1);
    items.forEach((item, j) => (item.index = j));
    items = items;
  }
  function sort(from, to) {
    if (to < 0 || to >= items.length) return false;
    items = moveTo(items, from, to);
  }

  function setMain() {
    items.forEach((g) => (g.main = false));
    items[0].main = true;
    items[0].enabled = true;
    items = items;
  }

  $: if (main && items.length) setMain();
</script>

<section class="ui-section">
  <h2 class="ui-h2"><span>{title}</span></h2>
  <div class="files ui-section__row" use:sortable={{ sort }}>
    {#each items as item, i (item)}
      <div
        class="ui-box ui-box--element"
        class:ui-box--uneditable={!main && !item.enabled}
        class:ui-cover={item === covers[0]}
        class:ui-cover--hover={item === covers[1]}
        data-sortable>
        <div class="actions">
          <DragHandle disabled={items.length < 2} on:step={(e) => sort(i, i + e.detail)} />
          <div>
            {#if targets && item[key]}
              <MoveTo
                {targets}
                here={GALLERY}
                on:move={(e) => dispatch('move', { from: GALLERY, index: i, to: e.detail })} />
            {/if}
            <Button size="sm" icon="delete" on:click={() => remove(i)} dangerous />
          </div>
        </div>
        <Picker bind:selected={item[key]} {fileContext} />
        {#if !main}
          <Input type="checkbox" bind:value={item.enabled}>Włączone</Input>
        {/if}
      </div>
    {/each}
    <span class="ui-add" use:beside><Button icon="add" on:click={push}>Dodaj</Button></span>
  </div>
</section>

<style>
  /* as many tiles as fit the row at --tile (three at least, on a phone), whole half cells wide and the last taking
     what's left, so the row reaches the mat's frame as the section's columns do (see .ui-section__row) */
  .files {
    --n: max(3, round(down, (100cqw + var(--page-pad)) / (var(--tile) + var(--page-pad)), 1));
    --w: round(down, (100cqw - (var(--n) - 1) * var(--page-pad)) / var(--n), var(--half));
    grid-template-columns: repeat(calc(var(--n) - 1), var(--w)) minmax(0, 1fr);
  }
  .files > .ui-box {
    gap: 0.25rem;
    padding: 0.5rem;
    --label-size: 0.75rem; /* the small checkbox's name, to fit a narrow tile */
  }

  .actions {
    display: flex;
    justify-content: space-between;
    gap: 0.3rem;
  }
  .actions div {
    display: flex;
    gap: 0.3rem;
  }
</style>
