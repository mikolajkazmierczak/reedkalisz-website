<script>
  import api from '$/api';
  import { deep, uid } from '%/utils';
  import { globalMargins, globals, labelings, priceViews } from '@/globals';
  import { overwriteGuard } from '@/overwrite';
  import Labelings from './Labelings.svelte';

  export let unsaved;
  export let company;

  let saving = false;

  let itemsOriginal;
  let items;
  $: updateItems($labelings, company);

  function parseLabelings(labelings, company) {
    // filter by company, sort and add unique IDs.
    return labelings
      .filter((l) => l.company === company.id)
      .sort((a, b) => a.index - b.index)
      .map((l) => ({
        ...l,
        _uid: uid(10),
        prices: l.prices.sort((a, b) => a.amount - b.amount).map((p) => ({ ...p, _uid: uid(10) })),
      }));
  }

  // The table is the company's labelings as loaded, edited. Another version of them in the store (someone else's save,
  // or the store read again after the connection came back) is loaded quietly, or asked about when there are edits
  // (see overwrite.js) - a store update for another company changes nothing.
  // The version: each saved row's id and `date_updated`.
  const stamp = (rows) =>
    rows
      .filter((l) => l.id != null && !l._new)
      .map((l) => [l.id, l.date_updated])
      .sort((a, b) => a[0] - b[0]);
  const ofCompany = (labelings) => labelings.filter((l) => l.company === company.id);
  let loadedFor = null; // the company the table is of

  // the table from the store as it is now (someone else's version, or this table's own save as saved)
  const fromStore = () => show(parseLabelings($labelings, company));
  const guard = overwriteGuard({ loaded: () => stamp(itemsOriginal), unsaved: () => unsaved, reload: fromStore });

  function show(parsed) {
    loadedFor = company.id;
    guard.reset();
    itemsOriginal = deep.copy(parsed);
    items = deep.copy(parsed);
  }

  function updateItems(labelings, company) {
    // (while saving - check()'s re-read included, Labelings sets it first - the save's own reload follows)
    if (!labelings || saving) return;
    if (company.id !== loadedFor) return show(parseLabelings(labelings, company));
    guard.seen(stamp(ofCompany(labelings)));
  }

  // just before saving (the store may be behind: the connection lost, say): false stops the save
  async function check() {
    const filter = { company: { _eq: company.id } };
    const rows = (await api.items('labelings').readByQuery({ fields: ['id', 'date_updated'], filter, limit: -1 })).data;
    const current = stamp(rows);
    if (!deep.same(current, stamp(ofCompany($labelings)))) await globals.update(labelings, { refresh: true });
    return guard.check(current);
  }

  globals.update(labelings);

  // needed for recacculating prices
  globals.update(globalMargins);
  globals.update(priceViews);
</script>

{#if items}
  <div class="company ui-fill-col">
    <Labelings
      bind:unsaved
      bind:saving
      {company}
      {itemsOriginal}
      {items}
      {check}
      on:saved={fromStore}
      on:cancel={() => guard.dropped()} />
  </div>
{/if}

<style>
  /* the table and what's under it in a column, the table giving way when the page is short (see .ui-fill) */
  .company {
    position: relative;
    width: 100%;
  }
</style>
