<script>
  import { createEventDispatcher } from 'svelte';
  import Filters from '@c/Filters.svelte';
  import { companyIcon } from '@c/CompanyIcon.svelte';
  import Bar from './mappings/Bar.svelte';

  // The bar of every API tab: the tab's main action (slot "before") with the company picker right next to it,
  // and the tab's details at the other end (the default slot). Everything wraps when there isn't room in a row.
  // While `busy` (scanning) the companies can't be picked: only the selected one stays, slot "busy" (what not to do
  // meanwhile) takes the others' place.
  const dispatch = createEventDispatcher();

  export let companies; // the supported ones
  export let selected;
  export let disabled = false; // e.g. while scanning
  export let busy = false;

  $: shown = busy ? companies.filter((c) => c.id === selected?.id) : companies;
</script>

<Bar>
  {#if $$slots.before}
    <div class="group"><slot name="before" /></div>
  {/if}
  <fieldset class="companies" {disabled}>
    <Filters
      filters={shown.map((c) => ({ label: c.name, value: c, image: companyIcon(c) }))}
      selected={shown.find((c) => c.id === selected?.id)}
      on:change={(e) => dispatch('change', e.detail.value)} />
  </fieldset>
  {#if busy}
    <div class="busy"><slot name="busy" /></div>
  {/if}
  {#if $$slots.default}
    <div class="group after"><slot /></div>
  {/if}
</Bar>

<style>
  .group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .after {
    gap: 1rem;
    margin-left: auto;
  }
  .busy {
    flex: 1 1 0; /* the room that's left: its text wraps before the details at the end do */
    min-width: 12rem;
    line-height: 1.2;
  }
  .companies {
    flex: 0 1 auto; /* as wide as its buttons, narrower (wrapping them) when the bar is short */
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }
  .companies :global(.filters) {
    flex-wrap: wrap;
  }
</style>
