<script>
  import { handleIndexClick, handleIndexInput } from './utils';
  import Icon from '$c/Icon.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Direct from './Direct.svelte';
  import Thresholds from './Thresholds.svelte';

  const types = [
    { id: 'direct', text: 'Bezpośrednio' },
    { id: 'price', text: 'Zależy od ceny produktu' },
    { id: 'area', text: 'Zależy od powierzchni' }
  ];

  export let apiCompany;
  export let mappings;
  export let mapping;

  // will switch the mapping from object to list just once
  $: if (mapping.type === 'direct' && Array.isArray(mapping.data)) {
    mapping.data = { company: 4, code: '' }; // Default to REED
  } else if (['price', 'area'].includes(mapping.type) && !Array.isArray(mapping.data)) {
    mapping.data = [];
  }

  function remove() {
    // Remove the item and reindex the rest.
    mappings = mappings.filter(m => m._uid !== mapping._uid).map((m, i) => ({ ...m, _index: i }));
  }

  async function handleInput(e) {
    await handleIndexInput(e, mappings, mapping);
    mappings = mappings;
  }
</script>

<div class="ui-box ui-box--element wrapper">
  <div class="left">
    <Button dangerous square icon="delete" on:click={remove} />
    <Input type="number" min={0} step={1} value={mapping._index} on:click={handleIndexClick} on:input={handleInput} />
    <div class="icon">|</div>
    <Input bind:value={mapping.code} placeholder="Kod producenta" />
    <Input type="select" bind:value={mapping.type} options={types} />
    <div class="icon">
      <Icon name="arrow_import" />
    </div>
  </div>

  <div class="right">
    {#if mapping.type === 'direct' && !Array.isArray(mapping.data)}
      <Direct {apiCompany} bind:company={mapping.data.company} bind:code={mapping.data.code} />
    {:else if ['price', 'area'].includes(mapping.type) && Array.isArray(mapping.data)}
      <Thresholds {apiCompany} bind:thresholds={mapping.data} />
    {/if}
  </div>
</div>

<style>
  .wrapper {
    --index-w: 4rem;
    --code-w: 10rem;
    --type-w: 15rem;
    --icon-w: 2rem;
    --gap: 0.5rem;
    display: grid;
    grid-template-columns: auto auto;
    padding: var(--gap);
    width: auto;
  }

  .left {
    align-self: start;
    display: grid;
    grid-template-columns: auto var(--index-w) var(--icon-w) var(--code-w) var(--type-w) var(--icon-w);
    gap: var(--gap);
  }
  .icon {
    place-self: center;
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--gap);
  }
</style>
