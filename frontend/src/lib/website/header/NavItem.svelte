<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  import { fly } from 'svelte/transition';
  import Icon from '$c/Icon.svelte';
  import NavSubitem from './NavSubitem.svelte';

  export let item;
  $: ({ id, folder, name, href, children } = item);

  $: contactHref = 'https://reed.kalisz.pl/kontakt';
  $: isContactPage = href === contactHref;
  $: active = href === $page.url.pathname || (isContactPage && $page.url.href === contactHref);
</script>

<div class="item" class:active>
  <a {href} on:click|preventDefault={active ? goto('/') : goto(href)}>
    <div class="content" class:folder>
      {name}
      {#if folder}
        <div class="icon"><Icon fill name="chevron_down" color={active ? 'var(--light)' : 'var(--main)'} /></div>
      {/if}
    </div>
  </a>

  <!-- {#if children.length}
    <div class="submenu" transition:fly={{ y: 10, duration: 400 }}>
      <div class="submenu-content">
        {#each children as child}
          <NavSubitem item={child} />
        {/each}
      </div>
    </div>
  {/if} -->
</div>

<style>
  .item {
    --bg: transparent;
    --bg-hover: var(--main);
    --bg-active: var(--main);
    --color: var(--main);
    --color-hover: var(--light);
    --color-active: var(--light);
    position: relative;
    height: 100%;
  }
  a {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    text-decoration: none;
    text-transform: uppercase;
    font-size: 1.15rem;
    font-weight: 500;
    background-color: var(--bg);
  }
  .item:hover a {
    background-color: var(--bg-hover);
  }
  .item.active a {
    background-color: var(--bg-active);
  }
  .content {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 1rem;
    height: 100%;
    transition: border-radius 100ms;
    color: var(--color);
    text-shadow: 0 0 5px rgba(255, 255, 255, 1);
  }
  .item:hover .content {
    color: var(--color-hover);
    text-shadow: initial;
  }
  .item.active .content {
    color: var(--color-active);
    text-shadow: initial;
  }
  .content.folder {
    padding-right: 0.5rem;
  }
  .icon {
    width: 1.25rem;
  }

  .submenu {
    position: absolute;
    top: calc(100% - 2px);
    left: 0;
    display: none;
    justify-content: center;
    width: 120ch;
    border: var(--border);
    background-color: var(--white);
  }
  .item:hover .submenu {
    display: flex;
  }
  .submenu-content {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    padding: 2rem;
    padding-bottom: 1.5rem;
    width: 100%;
  }
</style>
