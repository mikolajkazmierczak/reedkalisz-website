<script>
  import { fly } from 'svelte/transition';
  import { scrolled } from '@/scrolled';
  import { header } from '@/stores';
  import Icon from '$c/Icon.svelte';
  import BarButton from '@c/BarButton.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import Mat from '@c/Mat.svelte';
  import { CELL, remPx, whole } from '@/onGrid';

  $: title = $header?.title;
  $: icon = $header?.icon;
  $: tabs = $header?.tabs ?? []; // subpages: [{ label, href, active, status }] (see tabs.js)
  $: buttons = $header?.buttons ?? []; // on the right: [{ label, onClick }]

  // The tabs on the mat's half lines, as what lies on the mat: each starting 1px past one - the first at least 2.5rem
  // after the title (on a phone just the row's gap), each one widened to reach the gap before the next line. Measured,
  // as the title and the labels are as wide as their text (again when the title or the tabs change).
  const GAP = 0.5; // rem, between the tabs
  function onLines(node) {
    const text = node.previousElementSibling;
    const place = () => {
      const rem = remPx();
      const half = (CELL / 2) * rem;
      const row = node.parentElement;
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0; // (the phone's; 'normal' on a desktop)
      const least = matchMedia('(max-width: 50rem)').matches ? 0 : 2.5 * rem;
      const at = (el) => el.getBoundingClientRect().left + row.scrollLeft; // (the row scrolls on a phone)
      const frame = node.closest('header').querySelector('.top > .mat').getBoundingClientRect().left + half;
      const tabs = [...node.children].map((tab) => tab.firstElementChild);
      tabs.forEach((tab) => (tab.style.minWidth = ''));
      const widths = tabs.map((tab) => tab.getBoundingClientRect().width);
      const end = at(text) + text.getBoundingClientRect().width + gap;
      node.style.marginLeft = `${frame + 1 + whole(end + least - frame - 1, half) - end}px`;
      tabs.forEach((tab, i) => (tab.style.minWidth = `${whole(widths[i] + GAP * rem, half) - GAP * rem}px`));
    };
    const resizes = new ResizeObserver(place);
    resizes.observe(text);
    const changes = new MutationObserver(place);
    changes.observe(node, { childList: true });
    return { destroy: () => (resizes.disconnect(), changes.disconnect()) };
  }
</script>

<header class="ui-topbar" use:scrolled>
  <Mat bar />
  <div class="row">
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
      <nav class="tabs" use:onLines>
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
  </div>
</header>

<style>
  header {
    z-index: 5;
    overflow: hidden;
    /* fixed, not sticky: a sticky one stops at the end of its parent, which is a screen tall, so on a long page
       it scrolled away; the content leaves room for it (see the admin layout) */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    padding: var(--mat-margin) calc(var(--mat-margin) + 1px + var(--leftover)) 0
      calc(var(--nav-width) + var(--mat-margin));
    height: var(--header-height); /* see ui-admin.css */
    /* its mat where the page's starts and ends (see Mat) */
    --mat-left: var(--nav-width);
    --mat-right: var(--leftover);
  }
  /* what's in it in the middle of the mat's squares under its frame (the frame's margin above them) - a pixel less, so
     a button (--control, odd as a box's inside is) lies on whole pixels */
  .row {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    height: calc(var(--header-height) - var(--mat-margin) - 1px);
  }

  /* the icon in the middle of the mat's first two cells, on the line between them: the frame is where the padding
     ends, the line a cell on, the icon (2rem) half its width before it */
  .text {
    flex: none;
    display: flex;
    align-items: center;
    gap: 1rem;
    height: var(--bar-button);
    margin-left: calc(var(--cell) - 1rem);
  }
  .icon {
    flex: none;
    height: 2rem; /* as much smaller than the buttons as the title's capitals look */
  }
  /* its box from the capitals' top to the baseline: the capitals are what's centred, not the line with room for
     accents above and tails below */
  h1 {
    line-height: 1;
    text-box: trim-both cap alphabetic;
    white-space: nowrap;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--navy-950);
  }
  .tabs {
    display: flex;
    align-items: center;
    gap: 0.5rem; /* (GAP) */
    margin-left: 2.5rem; /* (at least: see onLines) */
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

  /* a phone: no menu beside it (see Nav), lower, in one line: what doesn't fit is scrolled to (a swipe) - the row, not
     the header, so its mat and perforation stay put */
  @media (max-width: 50rem) {
    header {
      padding: var(--mat-margin) 0 0;
      --mat-left: var(--lead);
      --mat-right: calc(var(--leftover) - var(--lead));
    }
    .row {
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      gap: 0.75rem;
      /* from where the page's boxes start, to where they end (see the admin layout) */
      padding: 0 calc(var(--mat-margin) + 1px + var(--leftover) - var(--lead)) 0
        calc(var(--mat-margin) + 1px + var(--lead));
    }
    .row > * {
      flex: none;
    }
    /* the icon as tall as the smaller title's capitals, beside them */
    .text {
      gap: 0.6rem;
      margin-left: 0;
      height: 100%;
    }
    .icon {
      height: 1.75rem;
    }
    h1 {
      font-size: 1.4rem;
    }
    .tabs,
    .buttons {
      margin-left: 0;
    }
  }
</style>
