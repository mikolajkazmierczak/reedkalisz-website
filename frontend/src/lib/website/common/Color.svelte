<script>
  import ProductColorTooltip from '#/products/ProductColorTooltip.svelte';
  import { parseColor } from '#/utils';
  import { swatch, NO_COLOR } from '$/colors';

  export let first = null; // { name, color, multicolor, transparent, wood, neutral }
  export let second = null;

  export let amount = null;
  export let available = false;

  export let size = '1.25rem';
  export let notooltip = false;

  $: ({ label, bg, fg, multicolor } = parseColor(first, second));
</script>

<div class="wrapper" style:height={size}>
  {#if !notooltip}
    <ProductColorTooltip {label} {amount} {available} />
  {/if}

  {#if multicolor}
    <div class="color multi">
      <img src="/multicolor.svg" alt="" />
    </div>
  {:else if bg || fg}
    {#if bg}<div class="color bg" style:background={swatch(bg)} />{/if}
    {#if fg}<div class="color fg" style:background={swatch(fg)} />{/if}
  {:else}
    <!-- none: a white dot crossed out (see $/colors) -->
    <div class="color" style:background={NO_COLOR} />
  {/if}
</div>

<style>
  .wrapper {
    -webkit-user-select: none;
    user-select: none;
    cursor: help;
    overflow: hidden;
    position: relative;
    border-radius: 50%;
    aspect-ratio: 1 / 1;
  }
  /* its edge is a ring over the colour, not a border around it: a darker shade of the colour itself (as in the admin),
     over both halves of a two-colour one and the multicolour's quarters */
  .wrapper::after {
    content: '';
    pointer-events: none;
    position: absolute;
    inset: 0;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
  }

  .color {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
  }
  .multi {
    transform: rotate(45deg);
  }
  .multi img {
    width: 100%;
  }
  .fg {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50%;
    height: 100%;
    transform: translateY(-50%) rotate(45deg);
    transform-origin: center left;
  }
</style>
