<script>
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';

  import socket from '$lib/admin/heimdall';
  import { page } from '$lib/admin/stores';
  import { makeTree } from '$lib/utils';

  import { updateGlobal, categories } from '$lib/admin/global';
  import Table from '$lib/admin/common/Table.svelte';
  import Button from '$lib/admin/input/Button.svelte';

  $page = { title: 'Kategorie', icon: 'categories' };

  let categoriesTree;

  async function read() {
    await updateGlobal(categories);
    categoriesTree = makeTree($categories);
  }

  read();

  async function listener(data) {
    const { match } = socket.checkMatch(data, 'categories');
    if (match) read();
  }
  socket.onChanges(listener);
  onDestroy(() => socket.offChanges(listener));
</script>

{#if categoriesTree}
  <div class="wrapper">
    <div class="actions">
      <Button on:click={() => goto('/admin/kategorie/+')} icon="add">Dodaj</Button>
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
      collection="categories"
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
