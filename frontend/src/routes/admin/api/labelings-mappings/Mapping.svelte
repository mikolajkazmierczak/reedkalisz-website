<script>
  import Icon from '$c/Icon.svelte';
  import { labelings } from '@/globals';
  import { findLabeling } from '@/labelings';
  import { newTarget } from './utils';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Target from './Target.svelte';
  import Thresholds from './Thresholds.svelte';

  const types = [
    { id: 'direct', text: 'Bezpośrednio' },
    { id: 'price', text: 'Według ceny' },
    { id: 'area', text: 'Według powierzchni' },
    { id: 'ignore', text: 'Nie importuj' },
  ];

  export let apiCompany;
  export let apiCodes = []; // labeling codes found in the api snapshot
  export let mappings;
  export let mapping;

  // the code is set when the rule is added (from the list of api codes) and never edited afterwards
  $: codeMissing = !apiCodes.includes(mapping.code);
  $: targets = mapping.type === 'ignore' ? [] : Array.isArray(mapping.data) ? mapping.data : [mapping.data];
  $: broken = [
    ...(apiCodes.length && codeMissing ? [`kodu "${mapping.code || '—'}" nie ma w API`] : []),
    ...targets
      // an unset target is not an error yet - the rule was just added, or `prune` will drop it
      .filter((t) => t.code && !findLabeling($labelings, t.company, t.code))
      .map((t) => `nie mamy znakowania "${t.code}"`),
  ];
  // a rule pointing at our labeling with the very same code does what the import does on its own
  $: useless =
    !broken.length &&
    targets.length > 0 &&
    targets.every((t) => t.company === apiCompany.id && t.code === mapping.code);

  const isTarget = (data) => !!data && !Array.isArray(data);

  // will switch the mapping data to the shape the type needs, just once
  $: if (mapping.type === 'ignore') {
    if (mapping.data !== null) mapping.data = null;
  } else if (mapping.type === 'direct' && !isTarget(mapping.data)) {
    mapping.data = newTarget(apiCompany, $labelings);
  } else if (['price', 'area'].includes(mapping.type) && !Array.isArray(mapping.data)) {
    mapping.data = [];
  }

  function remove() {
    mappings = mappings.filter((m) => m._uid !== mapping._uid);
  }
</script>

<div class="mapping">
  {#if broken.length}
    <small class="warning">Reguła nie zadziała: {[...new Set(broken)].join(', ')}.</small>
  {:else if useless}
    <small class="useless">Zbędna reguła: znakowanie zaimportuje się według kodu.</small>
  {/if}

  <div class="c-remove"><Button small dangerous square icon="delete" on:click={remove} /></div>
  <div class="c-code" class:missing={apiCodes.length && codeMissing}>{mapping.code || '—'}</div>
  <div class="c-type"><Input type="select" bind:value={mapping.type} options={types} /></div>

  {#if mapping.type === 'ignore'}
    <div class="c-condition">&mdash;</div>
    <div class="c-target ignored">znakowanie zostanie pominięte</div>
  {:else if mapping.type === 'direct' && isTarget(mapping.data)}
    <div class="c-condition">&mdash;</div>
    <div class="c-arrow"><Icon name="arrow_import" /></div>
    <Target {apiCompany} bind:company={mapping.data.company} bind:code={mapping.data.code} />
  {:else if ['price', 'area'].includes(mapping.type) && Array.isArray(mapping.data)}
    <Thresholds {apiCompany} unit={mapping.type === 'price' ? 'zł' : 'mm²'} bind:thresholds={mapping.data} />
  {/if}
</div>

<style>
  .mapping {
    display: grid;
    grid-template-columns: var(--columns);
    gap: var(--gap);
    align-items: center;
    padding: var(--gap) 0;
    border-bottom: var(--border-light);
  }
  .warning,
  .useless {
    grid-column: 1 / -1;
  }
  .warning {
    color: var(--main);
  }
  .useless {
    color: #b26a00;
  }
  .c-remove {
    grid-column: 1;
  }
  .c-code {
    grid-column: 2;
    /* the column fits the widest code, so the padding keeps it off its neighbours */
    padding: 0 0.5rem;
    white-space: nowrap;
    font-weight: bold;
  }
  .c-code.missing {
    color: var(--main);
    text-decoration: line-through;
  }
  .c-type {
    grid-column: 3;
  }
  .c-condition {
    grid-column: 4 / span 2;
    font-size: 0.9rem;
    color: var(--accent);
  }
  .c-arrow {
    grid-column: 6;
    place-self: center;
  }
  .c-target.ignored {
    grid-column: 7;
    font-size: 0.9rem;
    color: var(--accent-dark);
  }
</style>
