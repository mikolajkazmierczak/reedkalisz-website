<script context="module">
  import { companyIcon } from '@c/CompanyIcon.svelte';

  export const NONE = 'none'; // nobody's (see `none`)

  // the companies as a Select's options, by name, each with its favicon
  export const companyOptions = (list) =>
    [...(list ?? [])]
      .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
      .map((c) => ({ id: c.id, text: c.name, image: companyIcon(c) }));
</script>

<script>
  import globals, { companies } from '@/globals';
  import Select from '@c/Select.svelte';

  // A list's producer filter in its bar: all of them (''), a company's (its id), or - with `none` - nobody's (NONE).
  // No label: the favicon of the one picked says what it is, and "Producent" is its name on hover.
  export let value = '';
  export let none = false;

  globals.update(companies);
  $: options = [
    { id: '', text: 'Wszystkie', special: true },
    ...companyOptions($companies),
    ...(none ? [{ id: NONE, text: 'Brak', special: true }] : []),
  ];
</script>

<!-- as wide as its longest option: each one's text, unseen, in the same cell -->
<div class="producer">
  <Select bind:value {options} label="Producent" title="Producent" />
  {#each options as { text }}<span class="sizer" aria-hidden="true">{text}</span>{/each}
</div>

<style>
  .producer {
    flex: none;
    display: grid;
  }
  .producer > :global(*) {
    grid-area: 1 / 1;
  }
  /* a normal Select's button with a picture (see Select's .pictured), no height */
  .sizer {
    visibility: hidden;
    height: 0;
    overflow: hidden;
    padding: 0 1.5rem 0 calc(0.5rem + 1.35em);
    border-inline: solid 1px;
    font-size: 0.95rem;
    white-space: nowrap;
  }
</style>
