<script>
  import { uid } from '%/utils';
  import { labelings } from '@/globals';
  import { newTarget } from './utils';
  import Icon from '$c/Icon.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Target from './Target.svelte';

  // the matching threshold with the highest bound wins, so the order doesn't matter
  const types = [
    { id: 'gte', text: '≥' },
    { id: 'gt', text: '>' },
  ];

  export let apiCompany;
  export let thresholds;
  export let unit = '';

  function add() {
    // a new threshold continues the last one, or starts from the default labeling
    const last = thresholds.at(-1);
    const target = last ? { company: last.company, code: last.code } : newTarget(apiCompany, $labelings);
    thresholds = [...thresholds, { _uid: uid(10), type: 'gt', threshold: last?.threshold ?? 0, ...target }];
  }

  function remove(uid) {
    thresholds = thresholds.filter((t) => t._uid !== uid);
  }
</script>

{#each thresholds as t (t._uid)}
  <div class="c-type"><Input type="select" bind:value={t.type} options={types} /></div>
  <div class="c-value">
    <Input type="number" min={0} step={0.01} bind:value={t.threshold} />
    {#if unit}<small>{unit}</small>{/if}
  </div>
  <div class="c-arrow"><Icon name="arrow_import" /></div>
  <Target {apiCompany} bind:company={t.company} bind:code={t.code} />
  <div class="c-remove"><Button small dangerous square icon="delete" on:click={() => remove(t._uid)} /></div>
{/each}

<div class="c-add">
  <Button small icon="add" on:click={add}>Próg</Button>
</div>

<style>
  .c-type {
    grid-column: 4;
  }
  .c-value {
    grid-column: 5;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .c-value small {
    color: var(--accent-dark);
  }
  .c-arrow {
    grid-column: 6;
    place-self: center;
  }
  .c-remove {
    grid-column: 8;
  }
  .c-add {
    grid-column: 4 / span 2;
  }
</style>
