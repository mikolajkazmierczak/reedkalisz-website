<script context="module">
  export const NONE = 'none'; // nobody's (see `none`)

  // the companies as a Select's options, by name
  export const companyOptions = (list) =>
    [...(list ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'pl')).map(({ id, name }) => ({ id, text: name }));
</script>

<script>
  import { nanoid } from 'nanoid';
  import globals, { companies } from '@/globals';
  import Input from '@c/Input.svelte';

  // A list's "Producent" in its bar: everyone's (''), a company's (its id), or - with `none` - nobody's (NONE)
  export let value = '';
  export let none = false;

  const id = `producer-${nanoid(6)}`; // its label's (a click on it opens the list)

  globals.update(companies);
  $: options = [
    { id: '', text: 'Wszyscy', special: true },
    ...companyOptions($companies),
    ...(none ? [{ id: NONE, text: '❌ Bez producenta', special: true }] : []),
  ];
</script>

<div class="producer">
  <label class="ui-stat-label" for={id}>Producent</label>
  <Input {id} size="compact" type="select" bind:value {options} />
</div>

<style>
  label {
    cursor: pointer;
  }
  .producer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.1rem;
    height: 2rem;
    line-height: 1;
  }
</style>
