<script>
  import { createEventDispatcher } from 'svelte';
  import Select from '@c/Select.svelte';

  // Opened on "+ kategoria", its list open: picks one after another, closes with the list.
  const dispatch = createEventDispatcher();

  export let options; // see Select

  let value = '';
</script>

<span class="picker">
  <Select
    size="small"
    label="Kategoria"
    bind:value
    open
    keepOpen
    placeholder="wybierz…"
    {options}
    on:change={() => {
      dispatch('pick', value);
      value = ''; // (the next one is a change too)
    }}
    on:unchoose={(e) => dispatch('unpick', e.detail.value)}
    on:close={() => dispatch('close')} />
</span>

<style>
  .picker {
    max-width: 14rem;
  }
</style>
