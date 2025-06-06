<script>
  import { addLinks } from '#/utils';
  import NavItem from './NavItem.svelte';

  export let items;

  addLinks(items);
</script>

<nav>
  {#each items as item}
    <NavItem {item} />
  {/each}
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    height: 2.5rem;
    /* border: 2px solid var(--main); */
  }
</style>
