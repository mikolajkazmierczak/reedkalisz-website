<script>
  import { goto } from '$app/navigation';

  import Input from '$lib/admin/input/Input.svelte';

  export let filters;

  export let head;
  export let rows;
</script>

<div class="wrapper">
  <div class="filters">
    <img src="/icons/dark/filters.svg" alt="Filtry" />
    {#each filters as filter}
      <div
        class="filter"
        on:click={() => {
          // TODO: dispatch event to refresh items
          // TODO: remove from filters list
        }}
      >
        {@html filter} <img src="/icons/dark/close.svg" alt="Usuń" />
      </div>
    {/each}
  </div>
  <table>
    <tr class="head">
      {#each head as value}
        <td
          class="value head-value"
          class:checkbox={value.checkbox}
          on:click={() => {
            // TODO: change sorting
          }}
        >
          {#if value.icon}<img src="/icons/dark/{value.icon.src}" alt={value.icon.alt} />{/if}
          {#if value.title}{value.title}{/if}
        </td>
      {/each}
    </tr>
    {#each rows as row}
      <tr class="row">
        {#each row.data as value, i}
          <td
            class="value"
            class:checkbox={head[i].checkbox}
            on:click={() => {
              if (head[i].checkbox) value = !value;
              else goto(row.href);
            }}
          >
            {#if head[i].checkbox}
              <Input type="checkbox" {value} />
            {:else}
              {value}
            {/if}
          </td>
        {/each}
      </tr>
    {/each}
  </table>
  <div class="pagination">
    <div
      class="prev"
      on:click={() => {
        // dispatch event to change data
      }}
    >
      <img src="/icons/dark/arrow_left.svg" alt="poprzednie" />
    </div>
    <div
      class="next"
      on:click={() => {
        // dispatch event to change data
      }}
    >
      <img src="/icons/dark/arrow_right.svg" alt="następne" />
    </div>
  </div>
</div>

<style>
  .wrapper {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
  }
  img {
    max-height: 100%;
  }

  .filters {
    align-self: stretch;
    display: flex;
    align-items: center;
    border: var(--border);
    border-bottom: none;
    padding: 0.5rem;
    height: 40px;
    background-color: var(--light);
  }
  .filters > img {
    margin-right: 0.5rem;
  }
  .filter {
    cursor: pointer;
    display: flex;
    align-items: center;
    border: var(--border);
    border-radius: 20px;
    margin-right: 0.5rem;
    padding: 0.1rem 0.5rem;
    padding-right: 0.3rem;
  }
  .filter:hover {
    background-color: var(--teriary);
  }
  .filter > img {
    height: 20px;
    margin-left: 0.2rem;
  }

  table {
    border: var(--border);
    border-spacing: 0px;
    border-collapse: collapse;
  }
  tr {
    border-bottom: var(--border);
    background-color: var(--light);
  }
  tr:not(.head):hover {
    background-color: var(--accent-light);
  }
  .head {
    height: 40px;
    background-color: var(--accent-white);
  }

  .value {
    padding: 0.4rem 0.5rem;
    white-space: nowrap;
  }
  .value img {
    height: 22px;
  }
  .value.checkbox {
    text-align: center;
  }
  .row .value {
    cursor: pointer;
  }

  .pagination {
    align-self: stretch;
    display: flex;
    border: var(--border);
    border-top: none;
    /* margin-top: 1rem; */
    padding: 0.5rem;
    height: 40px;
    background-color: var(--light);
  }
</style>
