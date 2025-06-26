<script>
  import { companies } from '@/globals';
  import { handleIndexClick, handleIndexInput } from './utils';
  import Icon from '$c/Icon.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Direct from './Direct.svelte';
  import Thresholds from './Thresholds.svelte';

  const types = [
    { id: 'direct', text: 'Bezpośrednie' },
    { id: 'price', text: 'Cena' },
    { id: 'area', text: 'Powierzchnia' }
  ];

  export let mappings;
  export let mapping;

  function remove(uid) {
    // Remove the item and reindex the rest.
    mappings = mappings.filter(m => m._uid !== uid).map((m, i) => ({ ...m, _index: i }));
  }

  async function handleInput(e) {
    handleIndexInput(e, mappings, mapping);
    mappings = mappings;
  }
</script>

<div class="wrapper">
  <div class="left">
    <Button icon="delete" on:click={() => remove(mapping._uid)} />
    <Input type="number" min={0} step={1} value={mapping._index} on:click={handleIndexClick} on:input={handleInput} />
    <Input bind:value={mapping.code} />
  </div>

  <div class="arrow">
    <Icon name="arrow-right" />
  </div>

  <div class="type">
    <!-- add on:select or on:input or sth to change the mapping from object to list and in thresholds.svelte wait for mapping to be a list before displaying -->
    <Input type="select" bind:value={mapping.type} options={types} />
    <div class="mapping">
      {#if mapping.type === 'direct'}
        <Direct bind:company={mapping.company} bind:code={mapping.code} />
      {:else if ['price', 'area'].includes(mapping.type)}
        <Thresholds bind:thresholds={mapping} />
      {/if}
    </div>
  </div>
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 200px 20px auto;
  }
</style>
