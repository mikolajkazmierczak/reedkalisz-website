<script>
  import { deep, uid, diffSync } from '%/utils';
  import api from '$/api';
  import heimdall from '$/heimdall';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Mapping from './Mapping.svelte';

  export let company;

  let mappingsOriginal;
  let mappings;
  $: updateMappings(company);
  $: unsaved = diffSync(mappings || [], mappingsOriginal || []).changed;

  function updateMappings(company) {
    console.log(company);
    if (!company || !company.api_labelings_mappings) return;
    const items = deep.copy(company.api_labelings_mappings).map((item, i) => ({
      _uid: uid(10),
      _index: i,
      ...item
    }));
    console.log(items);
    mappingsOriginal = items;
    mappings = deep.copy(items);
  }

  async function save() {
    const data = deep.copy(mappings).map(item => {
      const { _uid, _index, ...rest } = item; // remove _uid and _index
      return rest;
    });
    await api.items('companies').updateOne(company.id, { api_labelings_mappings: data });
    heimdall.emit('companies', company.id);
  }

  function cancel() {
    mappings = deep.copy(mappingsOriginal);
  }

  function add() {
    mappings = [
      ...mappings,
      {
        _uid: uid(10),
        _index: mappings.length,
        code: '',
        type: 'direct', // default type
        mapping: { company: 4, code: '' } // REED
      }
    ];
  }
</script>

<div class="wrapper">
  <h2>Mapowanie automatycznych znakowań</h2>

  {#if mappings}
    {#each mappings as mapping (mapping._uid)}
      <Mapping bind:mappings bind:mapping />
    {/each}

    <Button icon="add" on:click={add}>Dodaj</Button>

    {#if unsaved}
      <Button icon="save" on:click={save}>Zapisz</Button>
      <Button on:click={cancel}>Anuluj</Button>
    {/if}
  {:else}
    <p>Struktura API producenta nie umożliwia konfiguracji automatycznych znakowań.</p>
  {/if}
</div>

<style>
  .wrapper {
    margin-top: 2rem;
    margin-bottom: 20rem;
  }

  h2 {
    margin-bottom: 1rem;
  }
</style>
