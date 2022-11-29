<script>
  import Icon from '$c/Icon.svelte';
  import HoverCircle from '$c/HoverCircle.svelte';
  import Tooltip from '$c/Tooltip.svelte';

  export let tick = false;
  export let round = false;

  export let label = null;
  export let icon = null;
</script>

<button class="button" class:round on:click>
  <HoverCircle color={'var(--primary-dark)'} show={tick} />
  <div class="content">
    {#if label}<Tooltip {label} />{/if}
    {#if icon}<Icon name={icon} light />{/if}
    <slot />
  </div>
</button>

<style>
  .button {
    cursor: pointer;
    overflow: hidden;
    position: relative;
    justify-self: center;
    outline: none;
    border: none;
    padding: 0;
    width: 100%;
    aspect-ratio: 1 / 1;
    background-color: transparent;
  }
  .button.round {
    border-radius: 50%;
  }

  .content {
    z-index: 1;
    position: relative;
    display: grid;
    place-items: center;
    padding: 0.3rem;
    width: 100%;
    height: 100%;
  }
</style>
