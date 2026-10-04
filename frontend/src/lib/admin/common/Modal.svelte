<script context="module">
  const open = []; // the modals shown, newest last: only that one takes Escape
  let ids = 0;
</script>

<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { portal } from '@/portal';
  import { scrolled } from '@/scrolled';
  import { onGrid } from '@/onGrid';
  import Button from '@c/Button.svelte';
  import Mat from '@c/Mat.svelte';

  // Every box over the page, the page dimmed under it. On top a bar: the `title`, what the `bar`
  // slot adds (counts, buttons) and the close button. What's in it scrolls under the bar - the bar frosting as it goes
  // under, as the pages' bars do - and the `actions` slot's buttons stay under it, always in view.
  // `on:close`: the close button, a click beside the box or Escape (the owner decides what that does). A text selected
  // by dragging out of or into the box isn't a click beside it.
  //   fit  - as wide as what's in it, up to `maxWidth` (a question, a short form, the changelog)
  //   fill - the whole window but a margin, like the file picker (a list to look through)
  const dispatch = createEventDispatcher();

  export let title = null;
  export let closeText = 'Zamknij'; // the close button; null: none (a question its buttons answer)
  export let type = 'fit';
  export let maxWidth = '32rem';
  export let layer = 1000; // z-index: popups 1000, errors 1002, dialogs over them 1500 (see Dialog)
  export let tone = null; // 'danger': about something that can't be undone, a red top edge; 'error': a red edge all round
  export let mat = false; // the board's cutting mat under what's in it (files to look through, as the picker)
  export let panel = null; // the box, for its owner (focus)
  export let scroller = null; // what scrolls, for its owner (back to the top)

  const self = {};
  open.push(self);
  onDestroy(() => open.splice(open.indexOf(self), 1));
  const titleId = `modal-title-${++ids}`;

  $: bar = !!(title || $$slots.bar || closeText);
  const grid = (node) => (mat ? onGrid(node) : undefined); // (what's on its mat kept on the cells, see onGrid)

  let pressedBeside = false;
  const keydown = (e) => e.key === 'Escape' && !e.defaultPrevented && open.at(-1) === self && dispatch('close');
</script>

<svelte:window on:keydown={keydown} />

<div class="bg" style:z-index={layer} use:portal in:fade={{ duration: 200 }} out:fade={{ duration: 150 }} />
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
    class:danger={tone === 'danger'}
    class:error={tone === 'error'}
    class:on-mat={mat}
    style:max-width={type === 'fit' ? `min(${maxWidth}, 100%)` : null}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? titleId : undefined}
    bind:this={panel}
    {...$$restProps}
    in:fly={{ y: 20, duration: 200 }}
    out:fade={{ duration: 100 }}>
    <div class="scroll" bind:this={scroller}>
      <div class="sheet" use:grid>
        {#if mat}<Mat />{/if}
        {#if bar}
          <div class="bar ui-topbar" use:scrolled={scroller}>
            {#if mat}<Mat bar />{/if}
            <div class="row" class:ui-bar={mat}>
              {#if title}
                <h3 class="title" id={titleId}>{title}</h3>
              {/if}
              <slot name="bar" />
              {#if closeText}
                <span class="close">
                  <Button icon="close" size="sm" secondary on:click={() => dispatch('close')}>
                    {closeText}
                  </Button>
                </span>
              {/if}
            </div>
          </div>
        {/if}
        <div class="body" class:barless={!bar}>
          <slot />
        </div>
      </div>
    </div>
    {#if $$slots.actions}
      <div class="actions"><slot name="actions" /></div>
    {/if}
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
  /* (one column as wide as the window, not as what's in it: a long line wraps at the edge instead of pushing the
     box off it, as on a phone) */
  .wrapper {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    place-items: center;
    padding: 2rem;
  }
  .wrapper.fill {
    padding: 1rem;
  }
  .panel {
    --pad: 1.5rem; /* beside what's in it */
    position: relative;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 4rem);
    overflow: hidden;
    border-radius: var(--box-radius);
    corner-shape: squircle;
    border: var(--border-light);
    background-color: var(--paper);
    box-shadow: var(--shadow-lifted);
  }
  /* as wide as the text (short lines don't stretch it), a long one wraps at the maximum */
  .panel:not(.fill) {
    width: max-content;
  }
  /* the board's, with its cutting mat (see .sheet): what's in it on the mat's frame, as a page's boxes */
  .panel.on-mat {
    background-color: var(--board);
  }
  .panel.danger {
    border-top: solid 0.1875rem var(--red-500);
  }
  .panel.error {
    border: solid 0.1875rem var(--red-500);
  }
  .panel.fill {
    width: 100%;
    height: calc(100vh - 2rem);
    max-height: none;
  }

  /* what scrolls: the bar stays over it */
  .scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  /* what's in it, at least as tall as the box: the mat under it scrolls with it, over the panel's ground and under
     what's in it (its own stacking context) */
  .sheet {
    position: relative;
    isolation: isolate;
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
  }
  .bar {
    z-index: 10; /* over what scrolls under it, the tiles' pills and corner buttons too */
    position: sticky;
    top: 0;
    flex: none;
    padding: 0.75rem var(--pad);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem; /* its buttons as close as a page's (Anuluj beside Importuj), the counts after them */
  }
  /* frosting in the panel's own paper, not the page's board */
  .panel:not(.on-mat) .bar {
    background-color: rgb(from var(--paper) r g b / calc(82% * var(--scrolled)));
  }
  .title {
    margin: 0 auto 0 0; /* the rest at the right end */
  }
  .close {
    display: flex;
    margin-left: auto;
  }
  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.25rem var(--pad) 1.25rem;
  }
  .body.barless {
    padding-top: 1.5rem;
  }
  /* on the mat, as an editor's sheet: whole half cells wide and at least as tall as the box allows, what's left over
     past the mat's frame (see the admin layout); what's on it in its slots from the frame - its bar a page's bar
     (.ui-bar) on the first cells, frosted round as the page's header is, what's under it from the next half line */
  .on-mat .sheet {
    --leftover: var(--sheet-leftover);
    --mat-inset: 0 var(--leftover) 0 0;
    flex: 0 0 auto;
    min-height: calc(round(down, 100% - 2 * var(--mat-margin) - 1px, var(--half)) + 2 * var(--mat-margin) + 1px);
  }
  .on-mat .bar {
    --mat-right: var(--leftover); /* (see Mat) */
    padding: var(--mat-margin) calc(var(--mat-margin) + 1px + var(--leftover)) 0 var(--mat-margin);
  }
  .on-mat .body {
    gap: var(--page-pad);
    padding: 0 calc(var(--mat-margin) + 1px + var(--leftover)) calc(var(--mat-margin) + 1px) var(--mat-margin);
  }
  .on-mat .body.barless {
    padding-top: var(--mat-margin);
  }
  .actions {
    flex: none;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0 var(--pad) 1.25rem;
  }

  /* a phone: closer to its edges, less padding in it */
  @media (max-width: 50rem) {
    .wrapper,
    .wrapper.fill {
      padding: 0.5rem;
    }
    .panel {
      --pad: 1rem;
      max-height: calc(100dvh - 1rem);
    }
    .panel.fill {
      height: calc(100dvh - 1rem);
    }
    .body.barless {
      padding-top: 1.25rem;
    }
  }
</style>
