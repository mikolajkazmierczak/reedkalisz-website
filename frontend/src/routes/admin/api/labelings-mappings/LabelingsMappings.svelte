<script>
  import { deep, uid, diffSync, deleteFields } from '%/utils';
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { labelings } from '@/globals';
  import { findLabeling } from '@/labelings';
  import { newTarget } from './utils';
  import Icon from '$c/Icon.svelte';
  import Button from '@c/Button.svelte';
  import Mapping from './Mapping.svelte';

  export let apiCompany;
  export let supported = false; // whether the api of this company provides labelings
  export let apiCodes = []; // labeling codes found in the api snapshot

  let mappingsOriginal = null;
  let mappings = null;

  $: apiCompany && updateMappings();
  $: unsaved = diffSync(mappings || [], mappingsOriginal || []).changed;

  $: codes = (mappings ?? []).map((m) => m.code).filter(Boolean);
  // all the codes the api uses - a code without a rule is still imported if we have a labeling
  // of that company with the very same code, otherwise it is lost
  $: apiCodeStates = apiCodes.map((code) => {
    const mapped = codes.includes(code);
    return { code, mapped, lost: !mapped && !findLabeling($labelings, apiCompany.id, code) };
  });
  $: someLost = apiCodeStates.some((c) => c.lost);
  $: duplicated = [...new Set(codes.filter((code, i) => codes.indexOf(code) !== i))];
  // every rule is its own grid, so the code column can't be `auto` - it is sized from the longest code
  $: codeWidth = `calc(${Math.max(3, ...codes.map((c) => c.length))}ch + 1.25rem)`;

  // Rules alphabetically by the api code, thresholds ascending (both on load and on save).
  function sort(items) {
    const byCode = (a, b) => a.code.localeCompare(b.code, undefined, { numeric: true });
    for (const item of items) {
      if (Array.isArray(item.data)) item.data.sort((a, b) => a.threshold - b.threshold);
    }
    return items.sort(byCode);
  }

  // Rules the user added but never filled in are dropped instead of being saved as broken ones.
  function prune(items) {
    const filled = (target) => !!target?.code;
    return items
      .map((item) => (Array.isArray(item.data) ? { ...item, data: item.data.filter(filled) } : item))
      .filter((item) => {
        if (item.type === 'ignore') return true; // has no target at all
        return Array.isArray(item.data) ? item.data.length > 0 : filled(item.data);
      });
  }

  function setMappings(items) {
    const decorated = sort(
      deep.copy(items).map((item) => {
        if (Array.isArray(item.data)) {
          item.data = item.data.map((data) => ({ _uid: uid(10), ...data }));
        }
        return { _uid: uid(10), ...item };
      }),
    );
    mappingsOriginal = decorated;
    mappings = deep.copy(decorated);
  }

  function updateMappings() {
    if (!supported) {
      mappingsOriginal = mappings = null;
      return;
    }
    setMappings(apiCompany.api_labelings_mappings ?? []);
  }

  async function save() {
    const data = prune(sort(deep.copy(mappings)));
    await deleteFields(data, ['_uid']);
    await api.items('companies').updateOne(apiCompany.id, { api_labelings_mappings: data });
    heimdall.emit('companies', apiCompany.id);
    setMappings(data); // pruned rules disappear without waiting for the update
  }

  function cancel() {
    mappings = deep.copy(mappingsOriginal);
  }

  function add(code) {
    mappings = [
      ...mappings,
      {
        _uid: uid(10),
        code,
        type: 'direct', // default type
        data: newTarget(apiCompany, $labelings),
      },
    ];
  }
</script>

<div class="wrapper ui-box" class:shrink={!mappings} style:--code-w={codeWidth}>
  <h3>Reguły importowania znakowań</h3>

  {#if mappings}
    {#if apiCodeStates.length}
      <small>
        <b>Kody znakowań w API.</b>
        <span class="hint-info">Kliknij, by dodać regułę.</span>
      </small>
      <div class="hint">
        {#each apiCodeStates as { code, mapped, lost }}
          <span class:lost>
            <Button small disabled={mapped} on:click={() => add(code)}>{code}</Button>
          </span>
        {/each}
      </div>
      {#if someLost}
        <small class="hint-info">
          Wyszarzone kody mają już regułę. Pozostałe znakowania zaimportują się według kodu.<br />
          Kody w <span class="lost-text">czerwonej ramce</span> nie mają reguły, ani znakowania o tym kodzie. Przy imporcie
          zostaną utracone.
        </small>
      {/if}
    {/if}
    {#if duplicated.length}
      <small class="error">
        Powtórzone kody u producenta: {duplicated.join(', ')}. Użyta zostanie pierwsza reguła.
      </small>
    {/if}

    <div class="table">
      <div class="head">
        <span class="c-remove"><Icon height="14px" name="delete" /></span>
        <span class="c-code">Kod</span>
        <span class="c-type">Typ</span>
        <span class="c-condition">Warunek</span>
        <span class="c-target">Znakowanie u nas</span>
      </div>

      {#each mappings as mapping (mapping._uid)}
        <Mapping {apiCompany} {apiCodes} bind:mappings bind:mapping />
      {:else}
        <p class="empty">
          {#if !apiCodeStates.length}
            Zeskanuj API, aby zobaczyć kody znakowań, dla których można dodać reguły.
          {:else}
            Brak reguł. Kliknij kod powyżej, aby dodać pierwszą.
          {/if}
        </p>
      {/each}
    </div>

    {#if unsaved}
      <div class="ui-pair actions">
        <Button icon="close" dangerous on:click={cancel}>Anuluj</Button>
        <Button icon="ok" on:click={save}>Zapisz</Button>
      </div>
    {/if}
  {:else}
    <p>Nie zaimplementowano dla API tego producenta lub jego struktura nie zawiera znakowań.</p>
  {/if}
</div>

<style>
  .wrapper {
    /* shared grid of all the rows (header, mappings, thresholds) */
    --gap: 0.5rem;
    --columns: 1.5rem var(--code-w) 12rem 4.5rem 6.5rem 1.5rem minmax(18rem, 1fr) 1.5rem;
    margin-top: 2rem;
    margin-bottom: 4rem;
  }
  .wrapper.shrink {
    display: inline-flex;
  }

  h3 {
    margin: 0;
  }
  .actions {
    /* `align-self` (not `justify-self`) - the panel is a column flex, so this is the cross axis */
    align-self: flex-start;
    min-width: 22rem;
  }

  .hint {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
  }
  .lost :global(button) {
    outline: solid 2px var(--main);
    outline-offset: 1px;
  }
  .lost-text {
    color: var(--main);
  }
  .hint-info {
    color: var(--accent-dark);
  }
  .error {
    color: var(--main);
  }

  .table {
    overflow-x: auto;
  }
  .head {
    display: grid;
    grid-template-columns: var(--columns);
    column-gap: var(--gap);
    padding-bottom: 0.25rem;
    border-bottom: var(--border-light);
    font-size: 0.85rem;
    color: var(--accent-dark);
  }
  .c-remove {
    grid-column: 1;
    place-self: center;
  }
  .c-code {
    grid-column: 2;
    padding: 0 0.5rem; /* matches the code cells, see Mapping.svelte */
  }
  .c-type {
    grid-column: 3;
  }
  .c-condition {
    grid-column: 4 / span 2;
  }
  .c-target {
    grid-column: 7;
  }
  .empty {
    margin: 0.75rem 0 0;
    color: var(--accent-dark);
  }
</style>
