<script>
  import { goto } from '$app/navigation';

  export let filters;

  export let head;
  export let rows;
</script>

<div class="wrapper">
  <div class="filters">
    <img src="/icon/filter.svg" alt="Filtry" />
    {#each filters as filter}
      <div
        class="filter"
        on:click={() => {
          // TODO: dispatch event to refresh items
          // TODO: remove from filters list
        }}
      >
        {@html filter} <img src="/icon/x.svg" alt="Usuń" />
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
          {#if value.icon}<img src="/icon/{value.icon.src}" alt={value.icon.alt} />{/if}
          {#if value.title}{value.title}{/if}
        </td>
      {/each}
    </tr>
    {#each rows as row}
      <tr class="row">
        {#each row.data as value, i}
          <td
            class="value row-value"
            class:checkbox={head[i].checkbox}
            on:click={() => {
              if (head[i].checkbox) value = !value;
              else goto(row.href);
            }}
          >
            {#if head[i].checkbox}
              <input type="checkbox" checked={value} />
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
      <img src="/icon/arrow_left.svg" alt="poprzednie" />
    </div>
    <div
      class="next"
      on:click={() => {
        // dispatch event to change data
      }}
    >
      <img src="/icon/arrow_right.svg" alt="następne" />
    </div>
  </div>
</div>

<style>
  .wrapper {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
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
    --border: solid 1px var(--grey-dark);
    border-bottom: var(--border);
    background-color: var(--light);
  }
  tr:not(.head):hover {
    background-color: rgb(245, 245, 245);
  }
  .head {
    height: 50px;
    background-color: var(--bg-2);
  }

  .value {
    padding: 0.4rem 0.5rem;
    white-space: nowrap;
  }
  .value.checkbox {
    text-align: center;
  }
  .row-value {
    cursor: pointer;
  }
  .row-value.checkbox {
    background-color: var(--teriary);
  }

  input {
    cursor: pointer;
    margin: 0;
    height: 1rem;
    width: 1rem;
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
