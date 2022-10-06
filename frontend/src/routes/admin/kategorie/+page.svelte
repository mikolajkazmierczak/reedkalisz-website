<script>
  import { makeTree } from '$lib/utils';
  import { page, edited } from '$lib/admin/stores';
  import { updateGlobal, categories } from '$lib/admin/global';

  import Table from '$lib/admin/common/Table.svelte';
  import Button from '$lib/admin/input/Button.svelte';

  $page = 'Kategorie';

  let categoriesTree;
  let categoriesTreeOriginal;

  async function read() {
    await updateGlobal(categories);
    categoriesTree = makeTree($categories);
    categoriesTreeOriginal = JSON.parse(JSON.stringify(categoriesTree));
  }

  read();
</script>

{#if categoriesTree}
  <div class="wrapper">
    <div class="actions">
      <Button on:click={() => console.log('nowa kategoria')} icon="add">Dodaj</Button>
    </div>

    <Table
      items={categoriesTree}
      head={[
        { checkbox: true, icon: 'eye' },
        { id: true, label: 'ID' },
        { label: 'Nazwa' },
        { blame: true, label: 'Dodano' },
        { blame: true, label: 'Zaktualizowano' }
      ]}
      mapper={$ => ({
        href: `/admin/kategorie/${$.slug}`,
        values: [
          $.enabled,
          $.id,
          $._meta.path.map(p => p + 1).join('.') + ' ' + $.name,
          // $._meta.path.join('.') + ' ' + $.name,
          { user: $.user_created, datetime: $.date_created },
          { user: $.user_updated, datetime: $.date_updated }
        ]
      })}
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
