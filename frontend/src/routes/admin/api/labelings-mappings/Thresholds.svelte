<script>
  import { handleIndexClick, handleIndexInput } from './utils';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Direct from './Direct.svelte';

  const types = [
    { value: 'gte', label: '>=' },
    { value: 'gt', label: '>' }
  ];

  export let thresholds;

  function add() {
    thresholds = [
      ...thresholds,
      {
        _uid: uid(10),
        _index: thresholds.length,
        type: 'gt',
        threshold: 0,
        company: 4, // REED
        code: ''
      }
    ];
  }

  function remove(uid) {
    // Remove the item and reindex the rest.
    thresholds = thresholds.filter(t => t._uid !== uid).map((t, i) => ({ ...t, _index: i }));
  }

  async function handleInput(e) {
    handleIndexInput(e, thresholds, uid);
    thresholds = thresholds;
  }
</script>

{#each thresholds as { _uid, _index, type, threshold, company, code } (_uid)}
  <Button icon="delete" on:click={() => remove(_uid)} />
  <Input type="number" min={0} step={1} value={_index} on:click={handleIndexClick} on:input={handleInput} />
  <Input type="select" bind:value={type} options={types} />
  <Input type="number" min={0} step={0.01} bind:value={threshold} />
  <Direct bind:company bind:code />
{/each}

<Button icon="add" on:click={add}>Dodaj</Button>
