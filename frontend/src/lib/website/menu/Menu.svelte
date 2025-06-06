<script>
  import MenuItems from './MenuItems.svelte';

  export let items;
</script>

<div class="wrapper">
  <MenuItems {items} />
</div>

<style>
  .wrapper {
    padding: 4.5rem 0;
  }
</style>
