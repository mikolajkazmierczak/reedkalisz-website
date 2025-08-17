<script>
  import { deep, uid, diffSync, deleteFields } from '%/utils';
  import api from '$/api';
  import heimdall from '$/heimdall';
  import Button from '@c/Button.svelte';
  import Mapping from './Mapping.svelte';

  export let apiCompany;

  let mappingsOriginal = null;
  let mappings = null;

  $: apiCompany && updateMappings();
  $: unsaved = diffSync(mappings || [], mappingsOriginal || []).changed;

  function updateMappings() {
    const items =
      apiCompany && apiCompany.api_labelings_mappings
        ? deep.copy(apiCompany.api_labelings_mappings).map((item, i) => {
            if (Array.isArray(item.data)) {
              item.data = item.data.map((data, j) => ({
                _uid: uid(10),
                _index: j,
                ...data
              }));
            }
            return {
              _uid: uid(10),
              _index: i,
              ...item
            };
          })
        : null;

    mappingsOriginal = items;
    mappings = deep.copy(items);
  }

  async function save() {
    const data = deep.copy(mappings);
    await deleteFields(data, ['_uid', '_index']);
    await api.items('companies').updateOne(apiCompany.id, { api_labelings_mappings: data });
    heimdall.emit('companies', apiCompany.id);
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
        data: { company: 4, code: '' } // REED
      }
    ];
  }
</script>

<div class="wrapper ui-box" class:shrink={!mappings}>
  <h3>Reguły importowania znakowań</h3>

  {#if mappings}
    <div class="mappings">
      {#each mappings as mapping (mapping._uid)}
        <Mapping {apiCompany} bind:mappings bind:mapping />
      {/each}
    </div>

    <div class="actions">
      <Button icon="add" on:click={add}>Dodaj</Button>

      {#if unsaved}
        <Button icon="save" on:click={save}>Zapisz</Button>
        <Button on:click={cancel}>Anuluj</Button>
      {/if}
    </div>
  {:else}
    <p>Nie zaimplementowano dla API tego producenta lub jego struktura nie zawiera znakowań.</p>
  {/if}
</div>

<style>
  .wrapper {
    margin-top: 2rem;
    margin-bottom: 20rem;
  }
  .wrapper.shrink {
    display: inline-flex;
  }
  .mappings {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .actions {
    display: flex;
    gap: 1rem;
  }
</style>
