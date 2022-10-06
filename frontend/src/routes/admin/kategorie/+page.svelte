<script>
  import { makeTree, diff } from '$lib/utils';
  import { page, edited } from '$lib/admin/stores';
  import { updateGlobal, categories } from '$lib/admin/global';

  import Table from '$lib/admin/common/Table.svelte';
  import Button from '$lib/admin/input/Button.svelte';
  import Editor from '$lib/admin/collections/category/Editor.svelte';

  $page = 'Kategorie';

  const fieldsToIgnore = ['*._meta', 'user_created', 'date_created', 'user_updated', 'date_updated'];
  let categoriesTree;
  let categoriesTreeOriginal;

  async function read() {
    await updateGlobal(categories);
    categoriesTree = makeTree($categories);
    categoriesTreeOriginal = JSON.parse(JSON.stringify(categoriesTree));
  }

  read();

  $: diff(categoriesTree, categoriesTreeOriginal, fieldsToIgnore).then(({ changed }) => ($edited = changed));
</script>

{#if categoriesTree}
  <div class="wrapper">
    <div class="actions">
      <Button on:click={() => console.log('nowa kategoria')} icon="add">Dodaj</Button>
    </div>

    <Table
      bind:items={categoriesTree}
      head={[
        { checkbox: true, icon: 'eye' },
        { id: true, label: 'ID' },
        { label: 'Nazwa' },
        { blame: true, label: 'Dodano' },
        { blame: true, label: 'Zaktualizowano' }
      ]}
      mapper={$ => ({
        values: [
          $.enabled,
          $.id,
          $._meta.path.map(p => p + 1).join('.') + ' ' + $.name,
          { user: $.user_created, datetime: $.date_created },
          { user: $.user_updated, datetime: $.date_updated }
        ]
      })}
      editor={Editor}
      order
    />
  </div>
{/if}

<style>
  .wrapper {
    overflow-x: auto;
  }
  .actions {
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: var(--border-radius);
    border: var(--border-light);
    background-color: var(--light);
  }
</style>
