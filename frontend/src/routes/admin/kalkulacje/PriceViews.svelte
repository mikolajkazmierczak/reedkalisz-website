<script>
  import { diff } from '$lib/utils';
  import { defaults } from '$lib/fields/price_views';
  import Input from '$lib/admin/input/Input.svelte';
  import Button from '$lib/admin/input/Button.svelte';

  const fieldsToIgnore = ['user_created', 'date_created', 'user_updated', 'date_updated'];

  export let items;
  let itemsOriginal = JSON.parse(JSON.stringify(items));
  let edited = false;

  function push() {
    items.push(defaults());
    items = items;
  }
  function remove(i) {
    const wasDefault = items[i].default;
    items.splice(i, 1);
    if (wasDefault) items[0].default = true;
    items = items;
    // TODO: save changes to the new default item
  }
  function setDefault(i) {
    items.forEach(item => (item.default = false));
    items[i].default = true;
    items = items;
    // TODO: save changes to changed items
  }

  $: diff(items, itemsOriginal, fieldsToIgnore).then(({ changed }) => (edited = changed));
</script>

<div class="wrapper">
  <div class="items">
    {#each items as item, i}
      <div class="ui-list">
        <div class="item" class:default={item.default}>
          <Input placeholder="Nazwa..." bind:value={item.name} />
          <Input type="list" placeholder="np. 100;200" value={item.amounts.join(';')} bind:list={item.amounts} />
        </div>
        <div class="actions">
          <Button icon="delete" dangerous square on:click={() => remove(i)} />
          {#if !item.default}
            <Button icon="star" square on:click={i => setDefault(i)} />
          {/if}
        </div>
      </div>
    {/each}
  </div>
  <Button icon="add" on:click={push}>Dodaj</Button>
</div>

<style>
  .items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-radius: var(--border-radius);
    border: var(--border-light);
    padding: 0.5rem;
    background-color: var(--primary-white);
  }
  .item.default {
    outline: 2px dashed var(--primary);
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
