<script>
  import { createEventDispatcher } from 'svelte';
  import Select from '@c/Select.svelte';

  // An image's "move to": a small button in its tile's corner, opening the places it can go (the gallery, the
  // variants - see the product editor's order.js). `on:move`: { detail: the place's id }.
  export let targets; // [{ id, text, note, swatch, icon }]
  export let here; // where it is now: marked, not picked
  const dispatch = createEventDispatcher();

  $: options = targets.map((t) => ({ ...t, disabled: t.id === here }));
</script>

<span class="move">
  <Select
    icon="arrow_routing"
    title="Przenieś do..."
    search={targets.length > 8}
    value={here}
    {options}
    on:change={(e) => dispatch('move', e.detail.value)} />
</span>

<style>
  /* as a small secondary button (see Button), not the table's bare icon */
  .move {
    display: flex;
  }
  .move :global(.select.iconic) {
    width: 1.5rem;
    height: 1.5rem;
    padding: 0.2rem;
    border-radius: var(--button-radius-small);
    color: var(--text);
    background-color: var(--grey-100);
  }
  .move :global(.select.iconic:not([disabled]):hover) {
    color: var(--text);
    background-color: var(--blue-100);
  }
  .move :global(.select.iconic[aria-expanded='true']) {
    color: var(--light);
    background-color: var(--navy-700);
  }
</style>
