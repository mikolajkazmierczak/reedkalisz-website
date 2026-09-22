<script>
  import { companies, labelings } from '@/globals';
  import { labelingText } from '@/labelings';

  import Input from '@c/Input.svelte';

  // The labeling to import. Stored as a company + its labeling code, but picked as one option,
  // just like in the product editor - only REED and the api company are offered.
  export let apiCompany;

  export let company;
  export let code;

  const companyName = (id) => $companies?.find((c) => c.id === id)?.name ?? '?';

  $: available = ($labelings ?? [])
    .filter((l) => [4, apiCompany.id].includes(l.company) && l.code) // REED (4) and the api company
    .sort((a, b) => a.company - b.company || a.code.localeCompare(b.code, undefined, { numeric: true }));

  $: current = available.findIndex((l) => l.company === company && l.code === code); // -1 when unset or missing
  $: missing = current === -1 && !!code; // nothing picked yet is not an error
  $: options = [
    // keep the current value selectable even if the labeling no longer exists (or is not picked yet)
    ...(current === -1 ? [{ id: -1, text: code ? `${companyName(company)} · ${code} (nie istnieje)` : '—' }] : []),
    ...available.map((l, i) => ({ id: i, text: labelingText(l, companyName(l.company)) })),
  ];

  // two-way: the select follows the stored labeling, and picking an option writes it back
  // (`synced` tells the two apart - without it the write-back would be reverted by the sync)
  let selected;
  let synced;
  $: if (current !== synced) {
    synced = current;
    selected = current;
  }
  $: apply(selected);

  function apply(i) {
    const labeling = available[i];
    if (!labeling || i === current) return;
    company = labeling.company;
    code = labeling.code;
  }
</script>

<div class="c-target" class:missing title={missing ? 'Wybierz istniejące znakowanie' : null}>
  <Input type="select" bind:value={selected} {options} />
</div>

<style>
  .c-target {
    grid-column: 7;
  }
  .missing :global(select) {
    outline: solid 2px var(--main);
  }
</style>
