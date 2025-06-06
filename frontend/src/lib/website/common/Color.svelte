<script>
  import ProductColorTooltip from '#/products/ProductColorTooltip.svelte';
  import { parseColor } from '#/utils';

  export let multicolored = false;
  export let first = null; // { name, color, enabled }
  export let second = null;

  export let amount = null;

  export let size = '20px';
  export let notooltip = false;

  export let onhoverchange = () => {};
  function handleHoverChange(e) {
    onhoverchange(e.type === 'pointerenter'); // otherwise must be 'pointerleave'
  }

  $: ({ label, bg, fg } = parseColor(multicolored, first, second));
</script>

<div class="wrapper" style:height={size} on:pointerenter={handleHoverChange} on:pointerleave={handleHoverChange}>
  {#if !notooltip}
    <ProductColorTooltip {label} {amount} />
  {/if}

  {#if multicolored}
    <div class="color multi">
      <img src="/multicolor.svg" alt="" />
    </div>
  {:else if bg || fg}
    {#if bg}<div class="color bg" style:background-color={bg.color} />{/if}
    {#if fg}<div class="color fg" style:background-color={fg.color} />{/if}
  {:else}
    <div class="color none">?</div>
  {/if}
</div>

<style>
  .wrapper {
    cursor: help;
    overflow: hidden;
    position: relative;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.2);
    aspect-ratio: 1 / 1;
  }

  .color {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
  }
  .multi {
    transform: rotate(45deg);
    /* background: rgb(180, 58, 58, 1); */
    /* background: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red); */
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
  .none {
    opacity: 0.5;
  }
</style>
