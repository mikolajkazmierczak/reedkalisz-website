<script>
  import Tooltip from '$c/Tooltip.svelte';

  export let amount;
  export let first = null; // name, color, enabled
  export let second = null;

  $: bg = first ?? second; // first could be unset
  $: fg = second; // doesnt matter if first is unset
  export let multicolored = false;

  $: title = bg && fg ? `${bg.name} / ${fg.name}` : bg ? bg.name : fg ? fg.name : null;
  $: label = multicolored ? 'Wielokolorowy' : title ?? 'Nieokreślony';
</script>

<div class="color-wrapper">
  <Tooltip label="<b>{label}</b><br/>W magazynie: {amount}" />
  {#if multicolored}
    <div class="color multi" />
  {:else if bg || fg}
    {#if bg}<div class="color bg" style:background-color={bg.color} />{/if}
    {#if fg}<div class="color fg" style:background-color={fg.color} />{/if}
  {:else}
    <div class="color none">?</div>
  {/if}
</div>

<style>
  .color-wrapper {
    overflow: hidden;
    position: relative;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.2);
    width: 20px;
    height: 20px;
  }
  .color {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
  }
  .none {
    opacity: 0.5;
  }
  .multi {
    background: rgb(180, 58, 58, 1);
    background: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red);
    transform: rotate(45deg);
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
