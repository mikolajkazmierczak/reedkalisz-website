<script>
  import { deep, uid, diffSync, deleteFields } from '%/utils';
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { companies, labelings } from '@/globals';
  import { tell } from '@/dialog';
  import { labelingText } from '@/labelings';
  import { mappedLabelings } from '@/sync';
  import { lostCodes, uselessRules } from '../status.js';
  import { newTarget } from './utils';
  import Button from '@c/Button.svelte';
  import HeadIcon from '@c/table/HeadIcon.svelte';
  import Panel from '../mappings/Panel.svelte';
  import Grid from '@c/table/Grid.svelte';
  import Mapping from './Mapping.svelte';

  export let apiCompany;
  export let apiCodes = []; // labeling codes found in the api snapshot

  let mappingsOriginal = [];
  let mappings = [];

  // once per company: a store update (even the echo of a save) mustn't wipe the edits (a new scan remounts this)
  let loadedId;
  $: if (apiCompany.id !== loadedId) {
    loadedId = apiCompany.id;
    setMappings(apiCompany.api_labelings_mappings ?? []);
  }
  $: unsaved = diffSync(mappings, mappingsOriginal).changed;

  $: codes = mappings.map((m) => m.code).filter(Boolean);
  // all the codes the api uses - a code without a rule is still imported if we have a labeling
  // of that company with the very same code, otherwise it is lost
  $: lost = new Set(lostCodes(apiCodes, mappings, $labelings, apiCompany.id));
  $: apiCodeStates = apiCodes.map((code) => ({ code, mapped: codes.includes(code), lost: lost.has(code) }));
  $: someLost = lost.size > 0;
  $: mappedCount = apiCodeStates.filter((s) => s.mapped).length;
  $: useless = new Set(uselessRules(mappings, apiCodes, $labelings, apiCompany.id));
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

  async function save() {
    const data = prune(sort(deep.copy(mappings)));
    await deleteFields(data, ['_uid']);
    await api.items('companies').updateOne(apiCompany.id, { api_labelings_mappings: data });
    heimdall.emit('companies', apiCompany.id);
    // the scanner only removes labelings the rules (or the codes without one) lead to: one no longer led to stays on
    // the products
    const led = (list) => mappedLabelings({ ...apiCompany, api_labelings_mappings: list }, apiCodes);
    const before = led(mappingsOriginal);
    const after = led(data);
    const key = (l) => `${l.company}|${l.code}`;
    const dropped = ($labelings ?? []).filter((l) => before.has(key(l)) && !after.has(key(l)));
    setMappings(data); // pruned rules disappear without waiting for the update
    if (dropped.length) {
      const name = (l) => labelingText(l, $companies?.find((c) => c.id === l.company)?.name);
      tell(
        `Żadna reguła nie prowadzi już do: ${dropped.map(name).join(', ')}. Produkty tego producenta, które je mają, ` +
          'zachowają je - skaner ich nie usunie. Trzeba to zrobić ręcznie.',
        { title: 'Uwaga' },
      );
    }
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

<Panel title="Mapowanie znakowań" {unsaved} on:save={save} on:cancel={cancel}>
  <svelte:fragment slot="summary">
    {#if apiCodeStates.length}
      <small>Zmapowano <b>{mappedCount}</b> / {apiCodeStates.length}</small>
      <small class="muted">Znakowania, które nie występują w regułach, nie są usuwane przez skaner.</small>
    {/if}
  </svelte:fragment>
  <!-- the hints as one block, the codes under their label (the box spaces its parts wider) -->
  <div class="legend">
    <small class="muted"> Miejsca są łączone (np. przód / tył) dla powtórzonych znakowań z tym samym polem. </small>
    {#if apiCodeStates.length}
      <!-- the codes' colours, each on a small copy of such a code -->
      <small>
        <span class="key key--grey">Wyszarzone</span> mają regułę.
        <span class="key">Niebieskie</span> są automatycznie przypisywane według kodu.
      </small>
      {#if someLost}
        <small>
          <span class="key key--red">Czerwone</span> nie mają ani reguły, ani odpowiadającego znakowania u nas.
        </small>
      {/if}
    {/if}
  </div>
  {#if apiCodeStates.length}
    <div class="codes">
      <small><b>Znakowania</b> · <span class="muted">Kliknij, by dodać regułę</span></small>
      <div class="chips">
        {#each apiCodeStates as { code, mapped, lost }}
          <Button size="sm" disabled={mapped} tone={lost ? 'danger' : null} on:click={() => add(code)}>{code}</Button>
        {/each}
      </div>
    </div>
  {/if}
  {#if duplicated.length}
    <small class="error">
      Powtórzone kody u producenta: {duplicated.join(', ')}. Użyta zostanie pierwsza reguła.
    </small>
  {/if}

  <svelte:fragment slot="after">
    <Grid
      columns="1.5rem {codeWidth} 10rem 4.5rem 6rem 1.5rem minmax(12rem, 1fr) 1.5rem"
      empty={mappings.length
        ? null
        : apiCodeStates.length
          ? 'Brak reguł. Kliknij kod powyżej, aby dodać pierwszą.'
          : 'Zeskanuj API, aby zobaczyć kody znakowań, dla których można dodać reguły.'}>
      <svelte:fragment slot="head">
        <span class="c-remove"><HeadIcon icon="delete" label="Usuwanie" /></span>
        <span class="c-code">Kod</span>
        <span class="c-type">Typ</span>
        <span class="c-condition">Warunek</span>
        <span class="c-target">Znakowanie u nas</span>
      </svelte:fragment>
      {#each mappings as mapping (mapping._uid)}
        <Mapping {apiCompany} {apiCodes} useless={useless.has(mapping)} bind:mappings bind:mapping />
      {/each}
    </Grid>
  </svelte:fragment>
</Panel>

<style>
  .c-remove {
    grid-column: 1;
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
</style>
