<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  import { fly } from 'svelte/transition';
  import Icon from '$c/Icon.svelte';
  import NavSubitem from './NavSubitem.svelte';

  export let item;
  $: ({ id, folder, name, href, children } = item);

  $: contactHref = 'https://new.reed.kalisz.pl/kontakt';
  $: isContactPage = href === contactHref;
  $: active = href === $page.url.pathname || (isContactPage && $page.url.href === contactHref);
</script>

<div class="item" class:active>
  <a {href} on:click|preventDefault={active ? goto('/') : goto(href)}>
    <div class="content" class:folder>
      {name}
      {#if folder}
        <div class="icon"><Icon name="chevron_down" color={active ? 'var(--light)' : 'var(--main)'} /></div>
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
    --border-blank: 2px solid transparent;
    --border: 2px solid var(--main);
    position: relative;
    display: flex;
    align-items: center;
  }
  a {
    border: var(--border-blank);
    text-decoration: none;
    text-transform: uppercase;
    font-size: 1.15rem;
    font-weight: 500;
  }
  .item:hover a {
    border: var(--border);
    background-color: var(--white);
  }
  .item.active a {
    background-color: var(--main);
  }
  .content {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 1rem;
    height: 2.5rem;
    color: var(--main);
    transition: border-radius 100ms;
  }
  .item.active .content {
    color: var(--white);
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
