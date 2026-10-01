<script>
  import { fly } from 'svelte/transition';
  import { scrolled } from '@/scrolled';
  import { header } from '@/stores';
  import Icon from '$c/Icon.svelte';
  import BarButton from '@c/BarButton.svelte';
  import Tooltip from '$c/Tooltip.svelte';

  $: title = $header?.title;
  $: icon = $header?.icon;
  $: tabs = $header?.tabs ?? []; // subpages: [{ label, href, active, status }] (see tabs.js)
  $: buttons = $header?.buttons ?? []; // on the right: [{ label, onClick }]
</script>

<header class="ui-topbar" use:scrolled>
  <div class="text">
    {#key icon}
      <div class="icon" in:fly={{ y: 50, duration: 350 }}>
        <Icon fill name={icon} />
      </div>
    {/key}
    {#key title}
      <h1 in:fly={{ y: 50, duration: 500 }}>{title}</h1>
    {/key}
  </div>
  {#if tabs.length}
    <nav class="tabs">
      {#each tabs as { label, href, active, status } (label)}
        <span class="tab">
          <BarButton {href} {active} warn={!!status}>{label}</BarButton>
          {#if status}
            <Tooltip>
              {#each status as note, i}{#if i}<br />{/if}<small>{note}</small>{/each}
            </Tooltip>
          {/if}
        </span>
      {/each}
    </nav>
  {/if}
  {#if buttons.length}
    <div class="buttons">
      {#each buttons as { label, onClick } (label)}
        <BarButton on:click={onClick}>{label}</BarButton>
      {/each}
    </div>
  {/if}
</header>

<style>
  header {
    --gap: 0.9rem;
    z-index: 5;
    overflow: hidden;
    /* fixed, not sticky: a sticky one stops at the end of its parent, which is a screen tall, so on a long page
       it scrolled away; the content leaves room for it (see the admin layout) */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    padding: var(--gap) 1.5rem var(--gap) calc(var(--nav-width) + 0.75rem);
    height: var(--header-height); /* see ui-admin.css */
  }

  /* the icon's drawing starts where the first box's content does (the page's padding, the box's border and its
     0.5rem padding - a bar's first button, the categories' "Wszystkie"): the icons are drawn 2 of their 20 units in,
     0.1 of the icon (2.1rem) */
  .text {
    display: flex;
    gap: 1rem;
    margin-left: calc(0.75rem + 1px + 0.5rem - 0.21rem);
  }
  /* as tall as the title's line, and a little lower: the line leaves room under the letters (for "y"), so its middle is
     above the middle of the capitals, which the eye lines the icon up with */
  .icon {
    position: relative;
    top: 0.11rem;
    height: 100%;
  }
  h1 {
    white-space: nowrap;
    font-weight: 700;
  }
  .tabs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 2.5rem;
  }
  .tab {
    display: flex; /* exactly the button: the Tooltip's hover target, since the active tab's link takes no pointer */
  }
  .buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }

  /* a phone: no menu beside it (see Nav), lower, in one line: what doesn't fit is scrolled to (a swipe) */
  @media (max-width: 50rem) {
    header {
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      align-items: center;
      gap: 0.75rem;
      padding: 0 0.75rem;
    }
    header > * {
      flex: none;
    }
    /* the icon as tall as the smaller title's capitals, beside them */
    .text {
      align-items: center;
      gap: 0.6rem;
      margin-left: 0;
      height: 100%;
    }
    .icon {
      top: 0;
      height: 1.75rem;
    }
    h1 {
      font-size: 1.4rem;
      line-height: 1;
    }
    .tabs,
    .buttons {
      margin-left: 0;
    }
  }
</style>
