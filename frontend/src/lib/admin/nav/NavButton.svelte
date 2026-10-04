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
  {#if icon}<span class="icon"><Icon fill name={icon} light color={tick ? 'var(--red-500)' : null} /></span>{/if}
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
    height: calc(1.5 * var(--cell)); /* (on the mat's half lines, see Nav) */
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
  /* where the pointer is: a lighter wash, no animation */
  .button:hover {
    background-color: rgb(255 255 255 / 0.07);
  }
  /* the page you're on: a tab of the board reaching into the menu, over its right padding and perforation, its icon in
     REED's red - drawn behind it, so the button keeps its size (the menu is as wide as its widest button) */
  .button.tick {
    position: relative;
    z-index: 1; /* (over the menu's perforation, see Nav: it would run over the tab's ring) */
  }
  .button.tick::before {
    content: '';
    z-index: -1;
    position: absolute;
    inset: 0 calc(-1 * var(--nav-end, 0.75rem)) 0 0;
    border-radius: var(--button-radius) 0 0 var(--button-radius);
    corner-shape: squircle;
    background-color: var(--board);
  }
  .tick .label {
    color: var(--text);
  }
  .warn {
    box-shadow: inset 0 0 0 1px var(--orange-500);
  }
  /* on the page you're on: around its tab instead, a little apart from it (as a top bar button's, see BarButton) - to
     the menu's edge, open there, where the tab joins the page */
  .button.tick.warn {
    box-shadow: none;
  }
  .button.tick.warn::after {
    --apart: 2px;
    content: '';
    z-index: -1;
    position: absolute;
    inset: calc(-1 * var(--apart) - 1px) calc(-1 * var(--nav-end, 0.75rem)) calc(-1 * var(--apart) - 1px)
      calc(-1 * var(--apart) - 1px);
    border: solid 1px var(--orange-500);
    border-right: none;
    border-radius: calc(var(--button-radius) + var(--apart) + 1px) 0 0 calc(var(--button-radius) + var(--apart) + 1px);
    corner-shape: squircle;
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
