<script context="module">
  import { NONE } from '@c/CompanySelect.svelte'; // (the same: a producer filter is one of these)
  export { NONE };
</script>

<script>
  import Select from '@c/Select.svelte';

  // A list's filter in its bar: any number of its options (`value` a list of their ids), all of them while none are
  // chosen (`all`, "Wszyscy" in the list; the button shows the filter's name then, "PRODUCENT"), and - with `none` -
  // the items without any (`NONE` among the ids, "Brak").
  export let label;
  export let options = [];
  export let value = [];
  export let all = 'Wszystkie';
  export let none = null; // the "Brak" option's text, or null for none

  $: choices = [
    { id: '', text: all, special: true },
    ...(none ? [{ id: NONE, text: none, special: true }] : []),
    ...options,
  ];
</script>

<div class="filter">
  <Select {label} emptyLabel={label} multiple bind:value options={choices} on:change />
</div>

<style>
  .filter {
    flex: none;
    display: flex;
    min-width: 9rem;
  }
</style>
