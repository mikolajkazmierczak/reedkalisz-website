<script>
  import Color from '#c/Color.svelte';
  import Gallery from './Gallery.svelte';
  import { parseAmount, AMOUNT, NONE } from '$/storage';

  export let code;
  export let storage;
  $: ({ amount, available, api_color_code, color_first, color_second, img } = storage);
  $: state = parseAmount({ available, amount });
  $: colorName = [color_first?.name, color_second?.name].filter(Boolean).join('\u00a0/\u00a0');
  // Two colours always take two lines: "Pomarańczowy" / "/ Biały".
  $: firstLine = (color_first ?? color_second)?.name;
  $: secondLine = color_first && color_second ? `/\u00a0${color_second.name}` : null;
</script>

<div class="storage" class:none={state.state === NONE}>
  <div class="badge">
    <div class="swatch">
      <Color first={color_first} second={color_second} {amount} {available} size="1.5rem" />
    </div>
    <h3 class:plain={!firstLine}>
      <small class="code">{api_color_code || code}</small>
      {#if firstLine}<span class="color">{firstLine}</span>{/if}
      {#if secondLine}<span class="color">{' '}{secondLine}</span>{/if}
    </h3>
  </div>

  <div class="amount">
    <small>Dostępność:</small>
    {#if state.state === AMOUNT}
      {state.label}
    {:else}
      <b class="state">{state.label}</b>
    {/if}
  </div>

  <Gallery
    small
    imgs={img}
    alt="{code} {colorName}"
    variant={{ code: api_color_code || code, first: color_first, second: color_second }} />
</div>

<style>
  /* the name, the availability and the photos on the rows of the cards' grid (+page's .storages): a row of cards has
     its "Dostępność" level, whatever names the cards have (a colour, two, a code over two lines) */
  .storage {
    position: relative;
    display: grid;
    grid-row: span 3;
    grid-template-rows: subgrid;
    row-gap: 0;
    border: 1px solid var(--border);
    background-color: var(--surface);
  }
  /* out of stock for now (CHWILOWY BRAK): its swatch and photos faded, its text as clear as any card's (fading the
     whole card would take its grey state below a readable contrast); whole again under the pointer */
  .storage.none .swatch,
  .storage.none :global(.gallery) {
    opacity: 0.55;
    transition: opacity var(--dur-fast) var(--ease);
  }
  .storage.none:hover .swatch,
  .storage.none:hover :global(.gallery) {
    opacity: 1;
  }

  /* The code and the colour's line(s): a second one only when there's a second colour ("/ Biały"); the swatch centres
     on the first two. The row is as tall as the tallest name of the cards beside it (see .storage). */
  .badge {
    --line: calc(var(--fs-xs) * 1.25);
    display: grid;
    grid-template-columns: 1.5rem minmax(0, 1fr);
    grid-template-rows: auto minmax(var(--line), auto) auto;
    column-gap: var(--sp-2);
    padding: var(--sp-2) var(--sp-3) var(--sp-1);
  }
  .swatch {
    grid-row: 1 / span 2;
    align-self: center;
  }
  h3 {
    display: grid;
    grid-row: 1 / span 3;
    grid-template-rows: subgrid;
    min-width: 0;
    font-size: var(--fs-xs);
  }
  .code {
    font-size: 0.6875rem;
  }
  /* no colour to name: the code alone, level with the swatch */
  .plain .code {
    grid-row: 1 / span 2;
    align-self: center;
  }
  .color {
    font-weight: 700;
    line-height: 1.25;
  }

  /* the state on the same line when there's room; under it, right below, when the card's too narrow */
  .amount {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 0.3em;
    line-height: 1.25;
    align-self: start;
    padding: 0 var(--sp-3) var(--sp-2);
    font-size: var(--fs-xs);
    font-variant-numeric: tabular-nums;
  }
  /* a number's line in every card (an empty piece as big as one), so "Dostępność" sits as low beside a state as
     beside a number, the row's labels level */
  .amount::before {
    content: '\200b';
    margin-right: -0.3em;
  }
  .amount > small {
    color: var(--ink-400);
  }
  /* as small as the label, in one piece, its capitals a little closer (still clear) so "CHWILOWY BRAK" fits beside the
     label more often */
  .state {
    font-size: 0.8333em;
    font-weight: 700;
    letter-spacing: -0.03em;
    white-space: nowrap;
    color: var(--green);
  }
  .storage.none .state {
    color: var(--ink-400);
  }

  .storage :global(.gallery) {
    padding: var(--sp-2);
    border-top: 1px solid var(--border);
  }
  .storage :global(.gallery .picker) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--sp-1);
  }
</style>
