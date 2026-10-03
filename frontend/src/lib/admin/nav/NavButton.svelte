<script>
  import Icon from '$c/Icon.svelte';

  // A button of the menu: an icon and its label; `tick` for the page you're on, `warn` when there's something to look
  // at there (an orange outline; the slot can hold a Tooltip saying what).
  export let tick = false;
  export let warn = false;
  export let label = null;
  export let icon = null;
  export let center = false; // a row of the menu's bottom grid, its icon over the avatar (Wyloguj, see Nav)
</script>

<button class="button" class:tick class:warn class:center on:click>
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
  /* a row of the menu's bottom grid (see Nav): the icon in the avatar's column, in its middle, the label in the name's;
     its left edge where the other buttons' are (the grid starts past the menu's skew) */
  .center {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    column-gap: 0;
    margin-left: calc(-1 * var(--nav-skew, 0rem));
    padding: 0; /* (a subgrid's padding would widen the menu) */
  }
  .center .icon {
    grid-column: 2;
    justify-self: center;
  }
  .center .label {
    grid-column: 3;
    margin-left: var(--nav-name-gap, 0.55rem);
    text-align: left; /* (a button centres it) */
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
