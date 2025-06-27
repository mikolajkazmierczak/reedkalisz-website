<script>
  import { companies } from '@/globals';

  import Input from '@c/Input.svelte';

  export let apiCompany;

  export let company;
  export let code;

  $: options = $companies
    .filter(c => [4, apiCompany.id].includes(c.id)) // only allow REED (4) and the current company
    .map(c => ({ id: c.id, text: c.name }));
</script>

<div class="wrapper">
  <Input type="select" bind:value={company} {options} />
  <Input bind:value={code} placeholder="Kod u nas" />
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: var(--code-w) var(--code-w);
    gap: 10px;
  }
</style>
