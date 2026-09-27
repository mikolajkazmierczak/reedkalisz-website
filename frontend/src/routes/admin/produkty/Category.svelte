<script>
  import { slide } from 'svelte/transition';
  import Button from '@c/Button.svelte';
  import CategoryCode from '@c/CategoryCode.svelte';

  // A category of the sidebar, drawn like the API's category tree: a line under the arrow of every level above,
  // and the arrow, number and name as one button (selecting a category opens it, selecting it again clears it).
  // One branch is open at a time: `open` is the number of the one opened last, it and the ones above it are open.
  export let depth; // its number: "1.2.3"

  export let id;
  export let name;
  export let enabled;
  export let children;
  $: hasChildren = children.length > 0;
  $: level = String(depth).split('.').length - 1;

  export let open;
  $: expanded = open == depth || !!open?.startsWith(depth + '.');
  export let selected;
  $: active = selected == id;

  function select() {
    if (selected == id) {
      selected = null;
      open = String(depth).split('.').slice(0, -1).join('.') || null; // closes it, the ones above stay open
    } else {
      selected = id;
      open = String(depth); // opens it, and closes every other branch
    }
  }
</script>

<div class="row" class:disabled={!enabled} class:leaf={!hasChildren}>
  {#each { length: level } as _}<span class="guide" />{/each}
  <span class="button" title="{depth} {name}">
    <Button
      small
      start
      width="100%"
      ghost={!active}
      selected={active}
      icon={hasChildren ? (expanded ? 'chevron_down' : 'chevron_right') : null}
      on:click={select}>
      <CategoryCode code={depth} />
      <span class="name">{name}</span>
    </Button>
  </span>
</div>

{#if hasChildren && expanded}
  <div transition:slide={{ duration: 200 }}>
    {#each children as { id, name, enabled, children }, i}
      <svelte:self {id} {name} {enabled} {children} depth="{depth}.{i + 1}" bind:open bind:selected />
    {/each}
  </div>
{/if}

<style>
  /* Lined up by what's drawn, not the icon's box: the ">" starts 37.5% into it. A category without children has its
     number where its siblings' ">" starts; a child's ">" (or number) starts where its parent's number does - so a level
     is 62.5% of the icon and the gap deep. The line of a level runs under the middle of its parent's arrow, just
     before the children's buttons. Bigger than a small button: it's read a lot */
  .row {
    --height: 1.75rem; /* of a line */
    --font: 0.95rem;
    --line: calc(1.2 * var(--font));
    --pad: 0.3rem; /* the button's, before the arrow */
    --icon: 1rem;
    --gap: 0.35rem; /* between the arrow, the number and the name */
    --code-after: calc(0.455rem - var(--gap)); /* the number's extra room before the name (see CategoryCode) */
    --arrow-in: calc(0.375 * var(--icon)); /* where the ">" starts in its icon */
    --step: calc(var(--icon) - var(--arrow-in) + var(--gap));
    /* the button's padding before the arrow: puts a level's line 0.225rem before the buttons under it */
    --pad-start: calc(2 * var(--pad) + var(--icon) / 2 - var(--step) + 0.125rem);
    display: flex;
    align-items: stretch;
  }
  .row.disabled .name {
    opacity: 0.35;
  }
  .guide {
    flex: none;
    position: relative;
    width: var(--step);
  }
  .guide::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(var(--pad-start) + var(--icon) / 2);
    border-left: solid 1px var(--black-10);
  }
  .button {
    flex: 1;
    display: flex; /* the button, not a line of text: no gap under it for the letters' descent */
    min-width: 0;
  }
  /* a long name wraps: the button grows with it, the arrow and the number stay on its first line */
  .button :global(button.small) {
    height: auto;
    min-height: var(--height);
  }
  .button :global(button.small .content.small) {
    align-items: flex-start;
    gap: var(--gap);
    padding: calc((var(--height) - var(--line)) / 2) var(--pad);
    padding-left: var(--pad-start);
    line-height: var(--line);
    font-size: var(--font);
    text-align: left;
  }
  .row.leaf .button :global(button.small .content.small) {
    padding-left: calc(var(--pad-start) + var(--arrow-in));
  }
  /* its size, not 58% of a height that now grows (Icon sets it inline, hence !important) */
  .button :global(button.small .content.small > svg) {
    flex: none;
    margin-top: calc((var(--line) - var(--icon)) / 2);
    width: var(--icon) !important;
    height: var(--icon) !important;
    transform: scale(0.9125); /* drawn a little smaller (0.9125rem), in the same place: what lines up with it stays */
  }
  .name {
    min-width: 0;
    overflow-wrap: anywhere;
  }
</style>
