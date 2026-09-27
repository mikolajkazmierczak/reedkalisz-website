<script>
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';

  const dispatch = createEventDispatcher();

  export let label;
  export let value;

  // given from above only: the parent picks it on `change`, or refuses (e.g. unsaved changes) and keeps the old one
  export let selected;

  $: active = selected === value;
</script>

<div class="wrapper">
  <Button small outline selected={active} on:click={() => !active && dispatch('change', { value })}>{label}</Button>
</div>

<style>
  .wrapper {
    display: flex;
    gap: 0.25rem;
  }
</style>
