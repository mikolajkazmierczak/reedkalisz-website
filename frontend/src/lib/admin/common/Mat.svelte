<script>
  // The cutting mat under the page (see --mat in ui-admin.css): faint squares inside a frame that stops short of the
  // board's edges, a ruler's ticks along the frame - four to a square, longer at each line, longest at every fifth.
  // It lies under what's on it and scrolls with it, as a board would: as big as its parent, inset by `--mat-inset`
  // (beside the menu, short of the leftover past the last half cell, up under an editor's bar).
  // Only its cells, frame and ticks are drawn: its margin shows what's under it (the board, a bar's frosting).
  // `bar`: the mat's top in a top bar (the page's header, an editor's, a modal's), lying exactly over the mat and
  // staying put while what scrolls under the bar is frosted (see .ui-topbar); `--mat-left` / `--mat-right` are where
  // the mat starts and ends in the bar (beside the menu, short of the leftover)
  export let bar = false;
</script>

{#if bar}
  <div class="top" aria-hidden="true"><div class="mat" /></div>
{:else}
  <div class="mat" aria-hidden="true" />
{/if}

<style>
  .mat {
    --tick: var(--mat-line); /* as faint as the mat's lines */
    --minor: 0.2rem; /* the ticks' lengths, out from the frame into the margin */
    --mid: 0.35rem;
    --major: 0.55rem;
    z-index: -1;
    pointer-events: none;
    position: absolute;
    inset: var(--mat-inset, 0);
    padding: var(--mat-margin);
    background: var(--mat);
    background-origin: content-box;
    background-clip: content-box;
    /* the frame: a line of the mat around its cells, at the edge of the margin */
    outline: solid 1px var(--mat-line);
    outline-offset: calc(-1 * var(--mat-margin) - 1px);
  }
  /* in a bar: clipped to it, the mat under it running on as far as a window (so no bottom frame shows) */
  .top {
    z-index: -1;
    pointer-events: none;
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  .top > .mat {
    inset: 0 var(--mat-right, 0) -100vh var(--mat-left, 0);
  }
  .mat::before,
  .mat::after {
    --ticks-x: linear-gradient(to right, var(--tick) 1px, transparent 1px);
    --ticks-y: linear-gradient(to bottom, var(--tick) 1px, transparent 1px);
    content: '';
    position: absolute;
  }
  /* the ruler along the top and the bottom, as long as the frame, its ticks out in the margin */
  .mat::before {
    inset: 0 var(--mat-margin);
    background:
      var(--ticks-x) left 0 top calc(var(--mat-margin) - var(--minor)) / var(--quarter) var(--minor),
      var(--ticks-x) left 0 top calc(var(--mat-margin) - var(--mid)) / var(--cell) var(--mid),
      var(--ticks-x) left 0 top calc(var(--mat-margin) - var(--major)) / calc(5 * var(--cell)) var(--major),
      var(--ticks-x) left 0 bottom calc(var(--mat-margin) - var(--minor)) / var(--quarter) var(--minor),
      var(--ticks-x) left 0 bottom calc(var(--mat-margin) - var(--mid)) / var(--cell) var(--mid),
      var(--ticks-x) left 0 bottom calc(var(--mat-margin) - var(--major)) / calc(5 * var(--cell)) var(--major);
    background-repeat: repeat-x;
  }
  /* and down the left and the right */
  .mat::after {
    inset: var(--mat-margin) 0;
    background:
      var(--ticks-y) left calc(var(--mat-margin) - var(--minor)) top 0 / var(--minor) var(--quarter),
      var(--ticks-y) left calc(var(--mat-margin) - var(--mid)) top 0 / var(--mid) var(--cell),
      var(--ticks-y) left calc(var(--mat-margin) - var(--major)) top 0 / var(--major) calc(5 * var(--cell)),
      var(--ticks-y) right calc(var(--mat-margin) - var(--minor)) top 0 / var(--minor) var(--quarter),
      var(--ticks-y) right calc(var(--mat-margin) - var(--mid)) top 0 / var(--mid) var(--cell),
      var(--ticks-y) right calc(var(--mat-margin) - var(--major)) top 0 / var(--major) calc(5 * var(--cell));
    background-repeat: repeat-y;
  }
</style>
