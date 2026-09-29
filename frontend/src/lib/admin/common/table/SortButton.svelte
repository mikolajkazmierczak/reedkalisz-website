<script>
  import Icon from '$c/Icon.svelte';

  // The button beside a table head's label that sorts by its column: small, grey as the head, navy when it's the one
  // the list is sorted by. What a click does is the list's (see Table): up, down, then back to its own order.
  export let label; // the column's
  export let active = false;
  export let desc = false;

  $: title = !active ? 'Sortuj rosnąco' : desc ? 'Sortowane malejąco' : 'Sortowane rosnąco';
</script>

<button class="sort" class:active {title} aria-label="{label}: {title.toLowerCase()}" on:click>
  <Icon
    fill
    name={active ? (desc ? 'arrow_sort_down' : 'arrow_sort_up') : 'arrow_sort'}
    color="currentColor"
    strokeWidth={0.3} />
</button>

<style>
  .sort {
    cursor: pointer;
    flex: none;
    display: grid;
    place-items: center;
    width: 1.2rem;
    height: 1.2rem;
    padding: 0.15rem;
    border: none;
    border-radius: 0.4rem;
    corner-shape: squircle;
    color: var(--grey-500);
    background-color: transparent;
  }
  /* the admin gives every element its own text colour, so the icon takes the button's */
  .sort :global(svg),
  .sort :global(use) {
    color: inherit;
  }
  .sort:hover {
    color: var(--navy-700);
    background-color: var(--black-6);
  }
  .sort.active {
    color: var(--light);
    background-color: var(--navy-700);
  }
</style>
