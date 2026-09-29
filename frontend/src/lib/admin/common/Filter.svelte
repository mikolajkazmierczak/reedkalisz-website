<script>
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';

  const dispatch = createEventDispatcher();

  export let label;
  export let value;
  export let image = null; // a picture's url (a company's favicon) before the label

  // given from above only: the parent picks it on `change`, or refuses (e.g. unsaved changes) and keeps the old one
  export let selected;

  $: active = selected === value;
</script>

<div class="wrapper">
  <Button small outline selected={active} on:click={() => !active && dispatch('change', { value })}
    >{#if image}<img class="image" src={image} alt="" />{/if}{label}</Button>
</div>

<style>
  .image {
    flex: none;
    width: 1em;
    height: 1em;
    object-fit: contain;
  }
  .wrapper {
    display: flex;
    gap: 0.25rem;
  }
</style>
