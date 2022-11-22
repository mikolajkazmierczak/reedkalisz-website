<script>
  import heimdall from '$/heimdall';
  import { makeTree } from '$/utils';
  import { updateGlobal, categories } from '@/globals';
  import Category from './Category.svelte';

  export let searchParams = null;
  export let category;

  $: searchParams?.set({ c: category });

  let items;

  async function read() {
    await updateGlobal(categories);
    items = makeTree($categories);
  }

  read();

  heimdall.listen(({ match }) => {
    if (match('categories')) read();
  });
</script>

<sidebar>
  <div>
    <h3 class="title">Kategorie</h3>
    <Category id={null} name={'Wszystkie'} enabled children={[]} depth={0} bind:selected={category} />
    {#if items}
      {#each items as { id, name, enabled, children }, i}
        <Category {id} {name} {enabled} {children} depth={i + 1} bind:selected={category} />
      {/each}
    {/if}
  </div>
</sidebar>

<style>
  sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem 1rem;
    min-width: 350px;
    border-radius: var(--border-radius);
    border: var(--border-light);
    background-color: var(--light);
  }
  sidebar .title {
    margin-bottom: 0.5rem;
  }
</style>
