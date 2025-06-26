<script>
  import { companies } from '@/globals';

  import Input from '@c/Input.svelte';

  export let company;
  export let code;
</script>

<div class="wrapper">
  <Input type="select" bind:value={company} options={$companies.map(c => ({ id: c.id, text: c.name }))} />
  <Input bind:value={code} placeholder="Kod" />
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 200px 200px;
    gap: 10px;
  }
</style>
