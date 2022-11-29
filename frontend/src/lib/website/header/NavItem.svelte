<script>
  import { fly } from 'svelte/transition';
  import Icon from '$c/Icon.svelte';
  import NavSubitem from './NavSubitem.svelte';

  export let item;
  $: ({ id, folder, name, href, children } = item);

  export let openedID;
  $: opened = openedID === id;

  function open() {
    openedID = null;
    if (children.length) openedID = id;
  }
  function close() {
    openedID = null;
  }
</script>

<div class="item">
  <a data-sveltekit-prefetch {href} class:opened on:mouseenter={open}>
    <div class="content" class:folder class:opened>
      {name}
      {#if folder}
        <div class="icon"><Icon name="chevron_down" light /></div>
      {/if}
    </div>
  </a>
</div>

{#if children.length && opened}
  <div class="submenu" on:mouseleave={close} transition:fly={{ y: 10, duration: 400 }}>
    <div class="submenu-content">
      {#each children as child}
        <NavSubitem item={child} />
      {/each}
    </div>
  </div>
{/if}

<style>
  .item {
    display: flex;
    align-items: flex-end;
    height: 100%;
  }
  a {
    border-radius: 15px 15px 0 0;
    padding-bottom: 10px;
    font-weight: 700;
    text-decoration: none;
    text-transform: uppercase;
    transition: background-color 200ms;
  }
  a.opened {
    background-color: var(--main-6);
  }
  .content {
    display: flex;
    align-items: center;
    gap: 5px;
    border-radius: 15px;
    padding: 0 15px;
    height: 30px;
    color: var(--light);
    background-color: var(--main-6);
    transition: border-radius 100ms;
  }
  .content.folder {
    padding-right: 10px;
  }
  .content.opened {
    border-radius: 15px 15px 0 0;
  }
  .icon {
    width: 15px;
  }

  .submenu {
    position: fixed;
    top: 60px;
    left: 0;
    display: flex;
    justify-content: center;
    width: 100%;
    background-color: var(--main-0);
  }
  .submenu-content {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    width: 100%;
    max-width: 1200px;
    padding: 20px;
    padding-bottom: 30px;
  }
</style>
