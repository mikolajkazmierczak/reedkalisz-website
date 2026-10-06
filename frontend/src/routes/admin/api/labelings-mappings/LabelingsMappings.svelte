<script>
  import { deep, uid, diffSync, deleteFields } from '%/utils';
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { companies, labelings } from '@/globals';
  import { tell } from '@/dialog';
  import { labelingText } from '@/labelings';
  import { mappedLabelings } from '@/sync';
  import { lostCodes, missingTargets, uselessRules } from '../status.js';
  import { lostLabelings } from '../health.js';
  import { groupItems } from '../items.js';
  import { newTarget } from './utils';
  import { savedRules } from '../mappings/savedRules.js';
  import Button from '@c/Button.svelte';
  import HeadIcon from '@c/table/HeadIcon.svelte';
  import Panel from '../mappings/Panel.svelte';
  import Grid from '@c/table/Grid.svelte';
  import Mapping from './Mapping.svelte';

  export let apiCompany;
  export let apiCodes = []; // labeling codes found in the api snapshot
  export let apiItems = []; // the snapshot's products

  let mappingsOriginal = [];
  let mappings = [];

  // loaded once per company, someone else's save loaded quietly or asked about (see savedRules.js); a new scan remounts
  // this
  const saved = savedRules('api_labelings_mappings', { load: setMappings, unsaved: () => unsaved });
  $: saved.follow(apiCompany);
  $: unsaved = diffSync(mappings, mappingsOriginal).changed;

  $: codes = mappings.map((m) => m.code).filter(Boolean);
  // all the codes the api uses - a code without a rule is still imported if we have a labeling
  // of that company with the very same code, otherwise it is lost
  $: lost = new Set(lostCodes(apiCodes, mappings, $labelings, apiCompany.id));
  $: apiCodeStates = apiCodes.map((code) => ({ code, mapped: codes.includes(code), lost: lost.has(code) }));
  $: someLost = lost.size > 0;
  // the codes that will be imported: by a working rule ("Nie importuj" counts as handled), or by the code itself
  $: imported = apiCodes.filter((code) => {
    const rule = mappings.find((m) => m.code === code);
    return !lost.has(code) && !(rule && missingTargets(rule, $labelings).length);
  });
  // the products with each code, and the ones with labelings at all: all of theirs imported, or not (as Komplikacje
  // on Produkty says it)
  $: byCode = groupItems(apiItems, (i) => (i._labelings ?? []).flatMap((l) => l.techniques ?? []));
  $: printed = (apiItems ?? []).filter((i) => i._labelings?.some((l) => l.techniques?.length));
  $: productsImported = printed.filter((i) => !lostLabelings(apiCompany, mappings, i, $labelings).size);
  $: useless = new Set(uselessRules(mappings, apiCodes, $labelings, apiCompany.id));
  $: duplicated = [...new Set(codes.filter((code, i) => codes.indexOf(code) !== i))];
  // every rule is its own grid, so the code column can't be `auto` - it is sized from the longest code
  // (in rem, not ch: the head's letters are smaller than the rows', its ch narrower - the columns would part; 0.625rem is
  // a bold digit of a row's code)
  $: codeWidth = `calc(${Math.max(3, ...codes.map((c) => c.length))} * 0.625rem + 1.25rem)`;

  // Rules alphabetically by the api code, thresholds ascending (both on load and on save).
  function sort(items) {
    const codeOrder = (a, b) => a.code.localeCompare(b.code, undefined, { numeric: true });
    for (const item of items) {
      if (Array.isArray(item.data)) item.data.sort((a, b) => a.threshold - b.threshold);
    }
    return items.sort(codeOrder);
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
      items.map((item) => {
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
    if (!(await saved.check(apiCompany))) return;
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
    saved.set(data); // pruned rules disappear without waiting for the update
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
    saved.dropped();
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

<Panel
  title="Mapowanie znakowań"
  note={apiCodeStates.length ? 'Znakowania nieobecne w regułach nie są usuwane przez skaner.' : null}
  stats={apiCodeStates.length
    ? [
        { label: 'Znakowania', done: imported.length, total: apiCodes.length },
        { label: 'Produkty', done: productsImported.length, total: printed.length },
      ]
    : []}
  {unsaved}
  on:save={save}
  on:cancel={cancel}>
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
      columns="1.5rem {codeWidth} 10rem 4.5rem 6rem 4.5rem 1.5rem minmax(12rem, 1fr) 1.5rem"
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
        <span class="c-products products-head">Produkty</span>
        <span class="c-target">Znakowanie u nas</span>
      </svelte:fragment>
      {#each mappings as mapping (mapping._uid)}
        <Mapping
          {apiCompany}
          {apiCodes}
          items={byCode.get(mapping.code) ?? []}
          useless={useless.has(mapping)}
          bind:mappings
          bind:mapping />
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
  .c-products {
    grid-column: 6;
  }
  .c-target {
    grid-column: 8;
  }
</style>
