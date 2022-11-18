<script>
  import { fly } from 'svelte/transition';
  import { page } from '@/stores';
  import Icon from '$c/Icon.svelte';

  $: title = $page?.title;
  $: icon = $page?.icon;
</script>

<header>
  <div class="text">
    {#key icon}
      <div class="icon" in:fly={{ y: 50, duration: 350 }}><Icon name={icon} /></div>
    {/key}
    {#key title}
      <h1 in:fly={{ y: 50, duration: 500 }}>{title}</h1>
    {/key}
  </div>
</header>

<style>
  header {
    --height: 4rem;
    --gap: 0.9rem;
    z-index: 1;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    padding: var(--gap) 1.5rem var(--gap) 4.75rem;
    height: var(--height);
    width: 100%;
    background-color: var(--accent);
  }

  .text {
    display: flex;
    gap: 1rem;
    margin-left: 1rem;
  }
  .icon {
    height: 100%;
  }
  h1 {
    white-space: nowrap;
    font-weight: 900;
  }
</style>
