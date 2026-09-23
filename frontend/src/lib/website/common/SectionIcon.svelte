<script>
  /** The catalogue section's name, as the CMS spells it. */
  export let name = '';

  // Matched on a word of the name, so "NOWOŚCI 2027" or a new emoji keeps its drawing.
  const kinds = [
    ['new', /nowo[śs]ci/i],
    ['best', /bestseller/i],
    ['sale', /promocj/i],
    ['gadgets', /gad[żz]et/i],
    ['print', /drukarni/i],
    ['calendar', /kalendar/i],
    ['stamp', /piecz[ąa]t/i],
    ['outdoor', /zewn[ęe]trzn/i],
    ['plate', /tabliczk/i],
  ];
  $: kind = kinds.find(([, re]) => re.test(name))?.[0] ?? 'box';
</script>

<!-- Shop-drawing line work, like the hero's: ink on a ground line, and one red part — the mark REED puts on it. -->
<svg class="icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <!-- plates, prints and calendars hang on a wall, everything else stands on the ground -->
    {#if !['plate', 'print', 'calendar'].includes(kind)}<path class="ground" d="M4 42h40" />{/if}

    {#if kind === 'gadgets'}
      <path d="M11 17h20v22a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3z" />
      <path d="M31 22h3a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4h-3" />
      <path class="soft" d="M17 12q2-2 0-4M23 12q2-2 0-4" />
      <rect class="mark" x="16.5" y="25" width="9" height="9" rx="1.5" />
    {:else if kind === 'print'}
      <!-- a poster unrolling from its roll behind the page, faded as one layer so its crossings don't darken -->
      <g class="faded">
        <path d="M20 4h18M20 10h18M20 4a3 3 0 0 0 0 6" />
        <ellipse cx="38" cy="7" rx="1.5" ry="3" />
        <path d="M21 10v3M38 10v22q0 4-4 4h-2" />
      </g>
      <path d="M11 13h15l6 6v23H11z" />
      <path d="M26 13v6h6" />
      <rect class="mark mark--fill" x="15" y="21" width="8" height="6" rx="0.5" />
      <path class="soft" d="M15 32h13M15 36h9" />
    {:else if kind === 'calendar'}
      <rect x="9" y="13" width="30" height="29" rx="2" />
      <path d="M9 21h30M17 9v7M31 9v7" />
      <g class="dots">
        <circle cx="15" cy="27" r="1.1" /><circle cx="21" cy="27" r="1.1" />
        <circle cx="27" cy="27" r="1.1" /><circle cx="33" cy="27" r="1.1" />
        <circle cx="15" cy="32" r="1.1" /><circle cx="21" cy="32" r="1.1" />
        <circle cx="33" cy="32" r="1.1" /><circle cx="15" cy="37" r="1.1" />
        <circle cx="21" cy="37" r="1.1" /><circle cx="27" cy="37" r="1.1" />
      </g>
      <circle class="mark" cx="27" cy="32" r="3.2" />
    {:else if kind === 'stamp'}
      <circle cx="24" cy="9" r="4" />
      <path d="M22 13l-1 7h6l-1-7" />
      <rect x="13" y="20" width="22" height="6" rx="1.5" />
      <path d="M15 26v2h18v-2" />
      <path class="soft" d="M18 33v2M24 32v3M30 33v2" />
      <path class="mark" d="M15 42h18" stroke-width="3" />
    {:else if kind === 'outdoor'}
      <rect x="6" y="8" width="36" height="20" rx="1.5" />
      <path d="M16 28v14M32 28v14" />
      <path class="soft" d="M16 35h16M23 15h13M23 20.5h9" />
      <circle class="mark mark--fill" cx="15" cy="18" r="4" />
    {:else if kind === 'plate'}
      <rect x="7" y="13" width="34" height="22" rx="2" />
      <g class="soft">
        <circle cx="11.5" cy="17.5" r="1" /><circle cx="36.5" cy="17.5" r="1" />
        <circle cx="11.5" cy="30.5" r="1" /><circle cx="36.5" cy="30.5" r="1" />
      </g>
      <path class="mark" d="M16 22h16" stroke-width="2.5" />
      <path class="soft" d="M19 27h10" />
    {:else if kind === 'new'}
      <path d="M10 24h28v18H10z" />
      <path class="soft" d="M10 24l-4-5M38 24l4-5M24 24v18" />
      <path class="mark mark--fill" d="M24 5q1 5 6 6q-5 1-6 6q-1-5-6-6q5-1 6-6z" />
      <path class="soft" d="M34 8v4M32 10h4M13 12v3M11.5 13.5h3" />
    {:else if kind === 'best'}
      <path d="M18 26h12v16H18zM8 32h10v10H8zM30 35h10v7H30z" />
      <path d="M19 4l3.5 7.5M29 4l-3.5 7.5" />
      <circle class="mark mark--fill" cx="24" cy="16" r="5" />
    {:else if kind === 'sale'}
      <path d="M11 18h26l2 24H9z" />
      <path d="M18 18v-3a6 6 0 0 1 12 0v3" />
      <g class="mark">
        <path d="M19.5 37l9-11" />
        <circle cx="20" cy="27.5" r="1.8" />
        <circle cx="28" cy="35.5" r="1.8" />
      </g>
    {:else}
      <path d="M10 20h28v22H10z" />
      <path class="soft" d="M10 26h28" />
      <path class="mark" d="M24 20v9" stroke-width="3" />
    {/if}
  </g>
</svg>

<style>
  .icon {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }
  .ground {
    stroke-opacity: 0.3;
  }
  .soft {
    stroke-opacity: 0.45;
  }
  .faded {
    opacity: 0.45;
  }
  .dots {
    fill: currentColor;
    fill-opacity: 0.5;
    stroke: none;
  }
  .mark {
    stroke: var(--red);
  }
  .mark--fill {
    fill: var(--red);
    stroke: none;
  }
</style>
