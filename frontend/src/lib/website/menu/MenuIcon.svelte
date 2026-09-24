<script>
  /** 'new', 'best' or 'sale': the three promotional sections get a small drawing in the menu. */
  export let kind;
</script>

<!-- The section drawings (SectionIcon) cut down to their mark: sparkles, a medal, a percent. -->
<svg class="icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
  <g stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    {#if kind === 'new'}
      <path class="mark--fill" d="M8 4.5q.9 5.6 6.5 6.5q-5.6.9-6.5 6.5q-.9-5.6-6.5-6.5q5.6-.9 6.5-6.5z" />
      <path class="fill" d="M15.5 1.5q.4 2.6 3 3q-2.6.4-3 3q-.4-2.6-3-3q2.6-.4 3-3z" />
      <path class="soft" d="M16.5 14v3.5M14.75 15.75h3.5" />
    {:else if kind === 'best'}
      <path d="M6 1.75l3.25 6.5M14 1.75l-3.25 6.5" />
      <circle class="mark--fill" cx="10" cy="13" r="4.75" />
    {:else if kind === 'sale'}
      <path d="M15.75 3.25l-11.5 13.5" />
      <g class="mark">
        <circle cx="5.5" cy="5.5" r="2.25" />
        <circle cx="14.5" cy="14.5" r="2.25" />
      </g>
    {/if}
  </g>
</svg>

<style>
  .icon {
    flex: none;
    width: 1.125rem;
    height: 1.125rem;
  }
  .soft {
    stroke-opacity: 0.45;
  }
  .mark {
    stroke: var(--red);
  }
  .fill {
    fill: currentColor;
    stroke: none;
  }
  .mark--fill {
    fill: var(--red);
    stroke: none;
  }
</style>
