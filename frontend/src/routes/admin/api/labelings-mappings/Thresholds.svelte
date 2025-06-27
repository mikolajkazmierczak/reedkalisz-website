<script>
  import { uid } from '%/utils';
  import { handleIndexClick, handleIndexInput } from './utils';
  import Icon from '$c/Icon.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Direct from './Direct.svelte';

  const types = [
    { id: 'gte', text: '>=' },
    { id: 'gt', text: '>' }
  ];

  export let apiCompany;
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

  async function handleInput(e, uid) {
    const threshold = thresholds.find(t => t._uid === uid);
    await handleIndexInput(e, thresholds, threshold);
    thresholds = thresholds;
  }
</script>

{#each thresholds as { _uid, _index: i, type, threshold, company, code } (_uid)}
  <div class="ui-box ui-box--optional threshold">
    <Button square icon="delete" on:click={() => remove(_uid)} />
    <Input type="number" min={0} step={1} value={i} on:click={handleIndexClick} on:input={e => handleInput(e, _uid)} />
    <div class="icon">|</div>
    <Input type="select" bind:value={type} options={types} />
    <Input type="number" min={0} step={0.01} bind:value={threshold} />
    <div class="icon">
      <Icon name="arrow_import" />
    </div>
    <Direct {apiCompany} bind:company bind:code />
  </div>
{/each}

<Button icon="add" on:click={add}>Dodaj</Button>

<style>
  .threshold {
    display: grid;
    grid-template-columns: auto var(--index-w) var(--icon-w) var(--index-w) var(--code-w) var(--icon-w) auto;
    gap: var(--gap);
    padding: var(--gap);
  }

  .icon {
    place-self: center;
  }
</style>
