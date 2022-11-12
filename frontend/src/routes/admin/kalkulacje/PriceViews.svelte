<script>
  import { defaults } from '$lib/fields/price_views';
  import Button from '$lib/admin/input/Button.svelte';
  import PriceView from './PriceView.svelte';

  export let items;

  function push() {
    items.push(defaults());
    items = items;
  }
</script>

<div class="wrapper">
  <div class="items">
    {#each items as item (item)}
      <PriceView bind:items {item} />
    {/each}
  </div>

  <div class="add">
    <Button icon="add" on:click={push}>Dodaj</Button>
  </div>
</div>

<style>
  .items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  .add {
    margin-top: 1rem;
  }
</style>
