<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import Button from '@c/Button.svelte';
  import { unsavedMapping } from '../company.js';

  // The frame of every mapping: a box with a title (and `summary` beside it, its parts parted by dots) and the hints
  // (the slot), under it its table and the rest
  // (`after`, on the page as the API products' table), save / cancel once something changed, and what goes under
  // those (`end`).
  const dispatch = createEventDispatcher();

  export let title;
  export let unsaved = false;
  $: $unsavedMapping = unsaved;
  onDestroy(() => ($unsavedMapping = false));
</script>

<div class="panel">
  <div class="ui-box">
    <div class="head">
      <h3>{title}</h3>
      <slot name="summary" />
    </div>
    <slot />
  </div>
  <slot name="after" />
  {#if unsaved}
    <div class="ui-pair actions">
      <Button icon="close" secondary edge on:click={() => dispatch('cancel')}>Anuluj</Button>
      <Button icon="ok" on:click={() => dispatch('save')}>Zapisz</Button>
    </div>
  {/if}
  <slot name="end" />
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  h3 {
    margin: 0;
  }
  /* the summary in the middle of the title's height (the categories' counts are two lines) */
  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 0.5rem;
  }
  .head > :global(small::before) {
    content: '·';
    margin-right: 0.5rem;
  }
  .actions {
    /* the panel is a column flex, so this is the cross axis */
    align-self: flex-start;
    min-width: 22rem;
  }
  /* the hints, the same in every mapping */
  .panel :global(.muted) {
    color: var(--grey-500);
  }
  .panel :global(.error) {
    color: var(--red-500);
  }
  .panel :global(.warning) {
    color: var(--orange-700);
  }
  .panel :global(.chips) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
  }
  /* the hints as one block, the chips under their label; each colour's hint starts with a small copy of such a chip
     (a small Button: navy, disabled, a tone) */
  .panel :global(.legend),
  .panel :global(.codes) {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .panel :global(.codes) {
    gap: 0.4rem;
  }
  .panel :global(.codes > .tools) {
    margin-top: 0.4rem; /* apart from the chips: they're what to click, these act on the list */
  }
  .panel :global(.legend > small) {
    color: var(--grey-500); /* (the admin colours every element) */
  }
  .panel :global(.key) {
    display: inline-block;
    padding: 0 0.3rem;
    border-radius: var(--button-radius-small);
    corner-shape: squircle;
    background-color: var(--navy-700);
    color: var(--light);
    font-size: 0.7rem;
    line-height: 1.35;
  }
  .panel :global(.key--grey) {
    background-color: var(--grey-100);
    color: var(--grey-500);
  }
  .panel :global(.key--red) {
    background-color: var(--red-100);
    color: var(--text);
  }
  .panel :global(.key--orange) {
    background-color: var(--orange-100);
    color: var(--text);
  }
  .panel :global(.tools) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
</style>
