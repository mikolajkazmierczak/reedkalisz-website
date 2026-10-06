<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import Button from '@c/Button.svelte';
  import { CELL, remPx, whole } from '@/onGrid';
  import { grow } from '@/grow';
  import { unsavedMapping } from '../company.js';

  // The frame of every mapping: its bar - Anuluj and Zapisz once something changed, `stats` ([{ label, done, total }]),
  // a line, then the title and `note` - joined under the companies' (see MappingPage) and sticking under the page's
  // header, so saving is always at hand; the hints in a box under it (the slot, unless `boxed` is false), then its table
  // and the rest (`after`, on the page as the API products' table).
  const dispatch = createEventDispatcher();

  export let title;
  export let note = null;
  export let stats = [];
  export let boxed = true;
  export let unsaved = false;
  $: $unsavedMapping = unsaved;
  onDestroy(() => ($unsavedMapping = false));

  // Stuck under the header, the bar is one of its own: its top line comes in over the first `distance` px
  // scrolled past where it sticks - along with the scroll (--stuck, 0 to 1), as the header's frost does
  function stuck(node) {
    const distance = 24;
    const set = () => {
      // (the panel's first child: 0 until it sticks, then how far the panel has gone up under it)
      const past = node.getBoundingClientRect().top - node.parentElement.getBoundingClientRect().top;
      node.style.setProperty('--stuck', Math.min(1, Math.max(0, past / distance)).toFixed(3));
    };
    addEventListener('scroll', set, { passive: true });
    addEventListener('resize', set);
    set();
    // a cell and a half, or whole half cells more when it wraps (a narrow window): what's under it stays on the mat
    // (it isn't one of onGrid's: it lies right under the companies' bar, not 1px into a slot of its own)
    const fit = () => {
      node.style.minHeight = '';
      node.style.minHeight = `${whole(node.getBoundingClientRect().height, (CELL * remPx()) / 2)}px`;
    };
    const resizes = new ResizeObserver(() => requestAnimationFrame(fit));
    resizes.observe(node);
    return {
      destroy() {
        removeEventListener('scroll', set);
        removeEventListener('resize', set);
        resizes.disconnect();
      },
    };
  }
</script>

<div class="panel">
  <div class="bar" use:stuck>
    {#if unsaved}
      <div class="lead" transition:grow>
        <Button icon="close" secondary edge on:click={() => dispatch('cancel')}>Anuluj</Button>
        <Button icon="ok" on:click={() => dispatch('save')}>Zapisz</Button>
        {#if !stats.length}<span class="ui-divider" />{/if}
      </div>
    {/if}
    {#if stats.length}
      <div class="counts">
        {#each stats as { label, done, total }}
          <span class="count">
            <span class="ui-stat-value"
              ><span class:complete={total && done === total}>{done}</span>{' '}<span class="of">/ {total}</span></span>
            <span class="ui-stat-label">{label}</span>
          </span>
        {/each}
      </div>
      <span class="ui-divider" />
    {/if}
    <h3>{title}</h3>
    {#if note}<small class="muted note">{note}</small>{/if}
  </div>
  {#if boxed}
    <div class="ui-box"><slot /></div>
  {/if}
  <slot name="after" />
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: var(--page-pad); /* half a cell of the mat, as a page's boxes */
    margin-bottom: 2rem;
  }
  /* the mapping's bar, a cell and a half (its lines in it) right under the companies' bar - the two as the bars of
     Produkty (see MappingPage) - sticking under the page's header, where it gets its own top line */
  .bar {
    --stuck: 0;
    position: sticky;
    top: var(--header-height);
    z-index: 4; /* over the page, under the header (5): it goes up under it where the panel ends */
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 0.5rem; /* (as Produkty's bar under the companies) */
    min-height: calc(1.5 * var(--cell));
    margin-left: 1px; /* (in its slot, as the companies' bar over it: see .ui-snap) */
    padding: 0 var(--box-pad); /* (Zapisz's height fits in its cell and a half, as Importuj's on Produkty) */
    border: var(--border-light);
    border-top-color: rgb(from var(--black-10) r g b / calc(alpha * var(--stuck)));
    border-radius: 0 0 var(--box-radius) var(--box-radius); /* (square on top, stuck too: against the header) */
    corner-shape: squircle;
    background-color: var(--paper);
    box-shadow: var(--shadow);
  }
  h3 {
    margin: 0;
  }
  /* its dot inside it: a narrow bar wraps the two together, not leaving the dot after the title */
  .note {
    line-height: 1.2;
  }
  .note::before {
    content: '·';
    margin-right: 0.5rem;
    font-size: 1rem;
  }
  /* Anuluj and Zapisz coming in together (with the line after them when there are no counts) */
  .lead {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  /* a line each, its label right after its number (a column of labels would read as one label broken in two), the
     numbers from one edge (they count different things: their digits have nothing to line up with); a little in, where
     Skanuj's rounded edge looks to start when they lead the bar; the total in the labels' muted ink; tabular digits, so
     the title after them doesn't shift as they change */
  .counts {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.1rem;
    height: var(--control);
    padding-left: 0.25rem;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .count {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
  }
  .of {
    color: var(--ink-muted);
  }
  /* all of them done */
  .complete {
    color: var(--green-700);
  }
  /* the hints, the same in every mapping */
  .panel :global(.muted) {
    color: var(--grey-500);
  }
  .panel :global(.error) {
    color: var(--red-500);
  }
  .panel :global(.warning) {
    color: var(--orange-700);
  }
  .panel :global(.chips) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
  }
  /* the hints as one block, the chips under their label; each colour's hint starts with a small copy of such a chip
     (a small Button: navy, disabled, a tone) */
  .panel :global(.legend),
  .panel :global(.codes) {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .panel :global(.codes) {
    gap: 0.4rem;
  }
  .panel :global(.codes > .tools) {
    margin-top: 0.4rem; /* apart from the chips: they're what to click, these act on the list */
  }
  .panel :global(.legend > small) {
    color: var(--grey-500); /* (the admin colours every element) */
  }
  .panel :global(.key) {
    display: inline-block;
    padding: 0 0.3rem;
    border-radius: var(--button-radius-small);
    corner-shape: squircle;
    background-color: var(--navy-700);
    color: var(--light);
    font-size: 0.7rem;
    line-height: 1.35;
  }
  .panel :global(.key--grey) {
    background-color: var(--grey-100);
    color: var(--grey-500);
  }
  .panel :global(.key--red) {
    background-color: var(--red-100);
    color: var(--text);
  }
  .panel :global(.key--yellow) {
    background-color: var(--ply-yellow);
    color: var(--text);
  }
  /* the Produkty column's head, over the counts: on their side, a little faint (they're what to click, not it) */
  .panel :global(.products-head) {
    text-align: right;
    color: var(--ink-muted);
  }
  .panel :global(.tools) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
</style>
