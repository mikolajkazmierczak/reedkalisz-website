<script context="module">
  const open = []; // the modals shown, newest last: only that one takes Escape
</script>

<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { portal } from '@/portal';

  // A box over the page, the page dimmed under it. `on:close`: a click beside it or Escape (the owner decides what
  // that does). A text selected by dragging out of or into the box isn't a click beside it.
  //   fit  - as wide as what's in it, up to `maxWidth` (a question, a short form)
  //   fill - the whole window but a margin, like the file picker (a list to look through: what's in it scrolls)
  const dispatch = createEventDispatcher();

  export let type = 'fit';
  export let maxWidth = '32rem';
  export let layer = 1000; // z-index: popups 1000, dialogs over them (see Dialog)
  export let danger = false; // about something that can't be undone: a red edge
  export let dotted = false; // the library's dotted grey under what's in it (files to look through, as the picker)
  export let panel = null; // the box, for its owner (focus)

  const self = {};
  open.push(self);
  onDestroy(() => open.splice(open.indexOf(self), 1));

  let pressedBeside = false;
  const keydown = (e) => e.key === 'Escape' && !e.defaultPrevented && open.at(-1) === self && dispatch('close');
</script>

<svelte:window on:keydown={keydown} />

<div class="bg" style:z-index={layer} use:portal transition:fade={{ duration: 150 }} />
<div
  class="wrapper"
  class:fill={type === 'fill'}
  style:z-index={layer}
  role="presentation"
  use:portal
  on:mousedown={(e) => (pressedBeside = e.target === e.currentTarget)}
  on:mouseup={(e) => (pressedBeside = pressedBeside && e.target === e.currentTarget)}
  on:click|self={() => pressedBeside && dispatch('close')}>
  <div
    class="panel"
    class:fill={type === 'fill'}
    class:danger
    class:dotted
    style:max-width={type === 'fit' ? `min(${maxWidth}, 100%)` : null}
    bind:this={panel}
    {...$$restProps}
    in:fly={{ y: 20, duration: 200 }}>
    <slot />
  </div>
</div>

<style>
  .bg,
  .wrapper {
    position: fixed;
    inset: 0;
  }
  .bg {
    background-color: var(--black-50);
  }
  .wrapper {
    display: grid;
    place-items: center;
    padding: 2rem;
  }
  .wrapper.fill {
    padding: 1rem;
  }
  .panel {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.75rem 1.5rem 1.25rem; /* more above and below the text than beside it */
    max-height: calc(100vh - 4rem);
    border-radius: var(--box-radius);
    corner-shape: squircle;
    border: var(--border-light);
    background-color: var(--light);
  }
  /* as wide as the text (short lines don't stretch it), a long one wraps at the maximum */
  .panel:not(.fill) {
    width: max-content;
  }
  .panel.dotted {
    background-color: var(--grey-100);
    background-image: url('/imgs/dot_grid.png');
    background-size: 10rem;
  }
  .panel.danger {
    border-top: solid 0.1875rem var(--red-500);
  }
  .panel.fill {
    width: 100%;
    height: calc(100vh - 2rem);
    max-height: none;
    padding: 1.25rem;
  }

  /* a phone: closer to its edges, less padding in it */
  @media (max-width: 50rem) {
    .wrapper,
    .wrapper.fill {
      padding: 0.5rem;
    }
    .panel {
      gap: 1rem;
      padding: 1.25rem 1rem 1rem;
      max-height: calc(100dvh - 1rem);
    }
    .panel.fill {
      height: calc(100dvh - 1rem);
      padding: 0.75rem;
    }
  }
</style>
