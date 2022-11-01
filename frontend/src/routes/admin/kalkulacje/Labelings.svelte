<script>
  export let companies;
  export let labelings;
</script>

<div class="items">
  {#each companies as company}
    {@const items = labelings.filter(l => l.company === company.id)}
    <h2>{company.name}</h2>
    {#each items as item}
      {item.name} {item.code} {item.type} <br />
    {/each}
  {/each}
</div>

<style>
  .items {
    overflow-x: auto;
  }
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: var(--border-radius);
    border: var(--border-light);
    background-color: var(--light);
  }
</style>
