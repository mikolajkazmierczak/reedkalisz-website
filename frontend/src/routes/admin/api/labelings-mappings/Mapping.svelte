<script>
  import { labelings } from '@/globals';
  import { missingTargets } from '../status.js';
  import { newTarget } from './utils';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Arrow from '../mappings/Arrow.svelte';
  import ProductsButton from '../mappings/ProductsButton.svelte';
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
  export let useless = false; // see uselessRules
  export let items = []; // the scan's products with the code

  // the code is set when the rule is added (from the list of api codes) and never edited afterwards
  $: codeMissing = !apiCodes.includes(mapping.code);
  $: broken = [
    ...(apiCodes.length && codeMissing ? [`kodu "${mapping.code || '—'}" nie ma w API`] : []),
    ...missingTargets(mapping, $labelings).map((t) => `nie mamy znakowania "${t.code}"`),
  ];

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

<div class="row">
  {#if broken.length}
    <small class="error">Reguła nie zadziała: {[...new Set(broken)].join(', ')}.</small>
  {:else if useless}
    <small class="useless">Zbędna reguła: znakowanie zaimportuje się według kodu.</small>
  {/if}

  <div class="c-remove"><Button size="sm" dangerous square icon="delete" on:click={remove} /></div>
  <div class="c-code" class:missing={apiCodes.length && codeMissing}>{mapping.code || '—'}</div>
  <!-- before the arrow, on the rule's first line (under its message: the cells after it run on over the thresholds'
       lines); red when the rule won't work (see `broken`), a yellow X when it leaves the code out -->
  <div class="c-products" style:grid-row={broken.length || useless ? 2 : 1}>
    <ProductsButton
      company={apiCompany}
      {items}
      title="Znakowanie {mapping.code}"
      tone={broken.length ? 'unmapped' : 'mapped'}
      ignored={mapping.type === 'ignore' ? 'Nie importuj: to znakowanie nie trafia na produkty.' : null} />
  </div>
  <div class="c-type"><Input size="small" type="select" label="Typ" bind:value={mapping.type} options={types} /></div>

  {#if mapping.type === 'ignore'}
    <div class="c-condition">&mdash;</div>
    <div class="c-target ignored">znakowanie zostanie pominięte</div>
  {:else if mapping.type === 'direct' && isTarget(mapping.data)}
    <div class="c-condition">&mdash;</div>
    <div class="c-arrow"><Arrow /></div>
    <Target {apiCompany} bind:company={mapping.data.company} bind:code={mapping.data.code} />
  {:else if ['price', 'area'].includes(mapping.type) && Array.isArray(mapping.data)}
    <Thresholds {apiCompany} unit={mapping.type === 'price' ? 'zł' : 'mm²'} bind:thresholds={mapping.data} />
  {/if}
</div>

<style>
  .error,
  .useless {
    grid-column: 1 / -1;
  }
  .useless {
    color: var(--orange-700);
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
    color: var(--red-500);
    text-decoration: line-through;
  }
  .c-products {
    grid-column: 6;
  }
  .c-type {
    grid-column: 3;
  }
  .c-condition {
    grid-column: 4 / span 2;
    font-size: 0.9rem;
    color: var(--grey-300);
  }
  .c-arrow {
    grid-column: 7;
    place-self: center;
  }
  .c-target.ignored {
    grid-column: 8;
    font-size: 0.9rem;
    color: var(--grey-500);
  }
</style>
