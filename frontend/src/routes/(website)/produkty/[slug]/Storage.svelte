<script>
  import Color from '#c/Color.svelte';
  import Gallery from './Gallery.svelte';
  import { parseAmount, AMOUNT, NONE } from '$/storage';

  export let company;
  $: codeSeparator = getCodeSeparator(company);

  export let code;
  export let storage;
  $: ({ amount, available, multicolored, api_color_code, color_first, color_second, img } = storage);
  $: state = parseAmount({ available, amount });
  $: colorName = multicolored
    ? 'wielokolorowy'
    : [color_first?.name, color_second?.name].filter(Boolean).join('\u00a0/\u00a0');
  // Two colours always take two lines: "Pomarańczowy" / "/ Biały".
  $: firstLine = multicolored ? 'WIELOKOLOROWY' : (color_first ?? color_second)?.name;
  $: secondLine = !multicolored && color_first && color_second ? `/\u00a0${color_second.name}` : null;

  function getCodeSeparator(company) {
    switch (company?.name) {
      case 'PAR':
        return '.';
      case 'MidOcean':
        return '-';
      default:
        return '';
    }
  }
</script>

<div class="storage">
  <div class="badge">
    <div class="swatch">
      <Color {multicolored} first={color_first} second={color_second} {amount} {available} size="1.5rem" />
    </div>
    <h3>
      <small class="code">{code}{api_color_code ? codeSeparator : ''}{api_color_code}</small>
      <span class="color">{firstLine ?? ''}</span>
      {#if secondLine}<span class="color">{' '}{secondLine}</span>{/if}
    </h3>
  </div>

  <div class="amount">
    <small>Dostępność:</small>
    {#if state.state === AMOUNT}
      {state.label}
    {:else}
      <b><small class:empty={state.state === NONE}>{state.label}</small></b>
    {/if}
  </div>

  <Gallery small imgs={img} alt="{code} {colorName}" />
</div>

<style>
  .storage {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    background-color: var(--surface);
  }

  /* Code and two colour lines on every card, so "Dostępność" lines up; the swatch centres on the first two. */
  .badge {
    --line: calc(var(--fs-xs) * 1.25);
    display: grid;
    grid-template-columns: 1.5rem minmax(0, 1fr);
    grid-template-rows: auto minmax(var(--line), auto) minmax(var(--line), auto);
    column-gap: var(--sp-2);
    padding: var(--sp-2) var(--sp-3);
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
  .color {
    font-weight: 700;
    line-height: 1.25;
  }

  .amount {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--sp-2);
    padding: 0 var(--sp-3) var(--sp-2);
    font-size: var(--fs-xs);
    font-variant-numeric: tabular-nums;
  }
  .amount > small {
    color: var(--ink-400);
  }
  .amount b {
    font-weight: 700;
  }
  .amount b small {
    color: var(--green);
  }
  .amount b small.empty {
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
