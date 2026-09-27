<script>
  import Icon from '$c/Icon.svelte';

  // A button of the menu: an icon and its label; `tick` for the page you're on, `warn` when there's something to look
  // at there (an orange outline; the slot can hold a Tooltip saying what).
  export let tick = false;
  export let warn = false;
  export let label = null;
  export let icon = null;
</script>

<button class="button" class:tick class:warn on:click>
  {#if icon}<span class="icon"><Icon fill name={icon} light /></span>{/if}
  <slot />
  {#if label}<span class="label">{label}</span>{/if}
</button>

<style>
  .button {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0 var(--nav-button-pad, 0.7rem);
    width: 100%;
    height: 2.4rem;
    border: none;
    border-radius: var(--button-radius); /* as the rest of the buttons */
    corner-shape: squircle;
    background-color: transparent;
  }
  /* the page you're on, and where the pointer is: just a darker background, no animation */
  .button:hover,
  .button.tick {
    background-color: var(--navy-900);
  }
  .warn {
    box-shadow: inset 0 0 0 1px var(--orange-500);
  }
  .icon {
    display: flex;
    flex: none;
    width: 1.3rem;
    height: 1.3rem;
  }
  .label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 0.95rem;
    color: var(--light);
  }
</style>
