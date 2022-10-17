<script>
  import { makeTree, treeRefreshMetaAndParent } from '$lib/utils';
  import { updateGlobal, categories } from '$lib/admin/global';

  import { defaults } from '$lib/fields/categories';
  import Table from '$lib/admin/common/Table.svelte';
  import Button from '$lib/admin/input/Button.svelte';

  let categoriesTree;

  async function read() {
    await updateGlobal(categories);
    categoriesTree = makeTree($categories);
  }

  read();

  function pushItem() {
    categoriesTree.push(defaults());
    treeRefreshMetaAndParent(categoriesTree);
    categoriesTree = categoriesTree;
  }
</script>

{#if categoriesTree}
  <div class="wrapper">
    <div class="actions">
      <Button on:click={pushItem} icon="add">Dodaj</Button>
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
        href: '/admin/kategorie/' + $.slug,
        values: [
          $.enabled,
          $.id,
          $._meta.path.map(p => p + 1).join('.') + ' ' + $.name,
          { user: $.user_created, datetime: $.date_created },
          { user: $.user_updated, datetime: $.date_updated }
        ]
      })}
      order
    />
  </div>
{/if}

<slot />

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
