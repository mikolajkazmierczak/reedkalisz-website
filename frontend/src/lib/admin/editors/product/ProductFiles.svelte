<script>
  import { moveItem } from '%/utils';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Picker from '@c/library/Picker.svelte';

  // A product's files in a row of boxes, each picked from the library, moved or taken away: its gallery (`main`: the
  // first image is the main one, dashed; no hiding a photo, one that shouldn't show goes) and its attachments
  // (downloaded from its page, each can be turned off).
  export let title;
  export let items; // rows with the file in `key`, `enabled`
  export let key = 'img';
  export let main = false;
  export let fileContext = null; // { used, history } file ids, for the picker

  // in the order shown (`index`: they're read back sorted by it)
  function push() {
    items = [...items, { [key]: null, enabled: true, index: items.length, ...(main && { main: false }) }];
  }
  function remove(i) {
    items.splice(i, 1);
    items.forEach((item, j) => (item.index = j));
    items = items;
  }
  function move(i, d) {
    items = moveItem(items, i, d);
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
  <h2 class="ui-h2">{title}</h2>
  <div class="files ui-section__row">
    {#each items as item, i (item)}
      <div class="ui-box ui-box--element" class:ui-box--uneditable={!main && !item.enabled} class:main={main && i == 0}>
        <div class="actions">
          <div>
            {#if i > 0}
              <Button size="sm" icon="arrow_left" on:click={() => move(i, -1)} square />
            {/if}
            {#if i < items.length - 1}
              <Button size="sm" icon="arrow_right" on:click={() => move(i, 1)} square />
            {/if}
          </div>
          <Button size="sm" icon="delete" on:click={() => remove(i)} dangerous />
        </div>
        <Picker bind:selected={item[key]} {fileContext} />
        {#if !main}
          <Input type="checkbox" bind:value={item.enabled}>Włączone</Input>
        {/if}
      </div>
    {/each}
    <Button icon="add" on:click={push}>Dodaj</Button>
  </div>
</section>

<style>
  .files {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10.9375rem, 1fr));
    gap: 1rem;
  }

  .main {
    outline: var(--outline-dashed);
  }
  .actions {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .actions div {
    display: flex;
    gap: 0.5rem;
  }
</style>
