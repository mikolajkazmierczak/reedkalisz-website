<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '@c/Button.svelte';

  // A value in a mapping cell: removable (a small ×), or only shown (inherited).
  const dispatch = createEventDispatcher();

  export let removable = false;
  export let inherited = false; // comes from a parent, dashed
  export let blocked = false; // "Ignoruj", "Bez kategorii": none of ours, on purpose
  export let missing = false; // points at something that no longer exists
  export let title = null;
</script>

<span class="chip" class:inherited class:blocked class:missing class:removable {title}>
  <span class="text"><slot /></span>
  {#if removable}
    <Button size="sm" ghost icon="close" borderRadius="0" title="Usuń" on:click={() => dispatch('remove')} />
  {/if}
</span>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.1rem;
    padding: 0 0.5rem;
    box-sizing: border-box;
    height: 1.5rem;
    border-radius: var(--border-radius);
    corner-shape: squircle;
    border: solid 1px var(--navy-700);
    overflow: hidden; /* the × stays inside the rounded border */
    max-width: 100%;
    font-size: 0.85rem;
    white-space: nowrap;
  }
  /* a long name is cut, the whole one is in the title */
  .text {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .chip.removable {
    padding-right: 0;
  }
  .chip.removable :global(button) {
    height: 100%; /* inside the chip's border, not over it */
  }
  .inherited {
    border-style: dashed;
    border-color: var(--edge);
    color: var(--grey-500);
  }
  /* "Ignoruj" isn't one of ours: edged like the others, on a grey ground (an inherited one dashed and grey, as any) */
  .blocked {
    background-color: var(--grey-100);
  }
  .missing {
    border-color: var(--red-500);
    color: var(--red-500);
  }
</style>
