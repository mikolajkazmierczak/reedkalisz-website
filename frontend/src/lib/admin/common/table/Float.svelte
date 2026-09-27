<script>
  import { float } from './float';

  // A table cell's content, cut to the cell ("..." for text, a fade for the rest, e.g. a Blame pill); on hover a cut
  // one shows whole over its neighbours, the row's full height (see float.js).
  export let enabled = true; // false: just cut
  export let fade = false; // for what can't end in "..." (not text): a cut one fades out on the right
  export let title = null;
</script>

<span class="float" class:fade use:float={{ enabled }} {title}><span class="inner"><slot /></span></span>

<style>
  .float {
    --pad: 0.35rem; /* the floating box's padding, it moves out by as much, so the content stays in place */
    position: relative;
    display: block;
    height: 1.5rem;
  }
  .inner {
    position: absolute;
    top: 0;
    left: 0;
    display: block; /* a line of text: the "..." needs it */
    width: 100%;
    height: 100%;
    line-height: 1.5rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /* what isn't text (a Blame pill) sits in the middle of the line, not on its baseline (it'd be cut at the bottom) */
  .inner > :global(*) {
    vertical-align: middle;
    line-height: 1.2; /* its own, not the cell's 1.5rem line (the pill would be taller than the cell) */
  }
  /* what can't end in "..." fades out on the right, into the row's colour */
  .float.fade:global(.cut)::after {
    content: '';
    pointer-events: none;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 1.5rem;
    background: linear-gradient(to right, transparent, var(--row-bg, var(--light)));
  }
  /* (the classes are set by float.js, only when the content is cut) */
  .float:global(.floating) {
    z-index: 2;
  }
  .float:global(.floating)::after {
    display: none;
  }
  /* opaque, over the next cells, as tall as the row: the row's hover grey over white. The row's padding goes on as
     padding (the line stays 1.5rem, in exactly the same place - a taller line rounds the text a pixel off) */
  .float:global(.floating) .inner {
    top: calc(-1 * var(--row-pad, 0rem));
    overflow: visible;
    width: auto;
    min-width: calc(100% + 2 * var(--pad));
    height: auto;
    padding: var(--row-pad, 0rem) var(--pad);
    transform: translateX(calc(-1 * var(--pad)));
    outline: solid 1px var(--black-10);
    background-color: var(--row-bg, var(--grey-50)); /* the row's, hovered (orange on an orange row) */
  }
  .float:global(.floating.flipped) .inner {
    transform: translateX(var(--pad));
  }
</style>
