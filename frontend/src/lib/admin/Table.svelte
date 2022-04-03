<script>
  import { goto } from '$app/navigation';

  import Input from '$lib/components/Input.svelte';

  export let head;
  export let items;
  export let filters;
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
      {#each head as item}
        <td
          class:centered={item.centered}
          on:click={() => {
            // TODO: change sorting
          }}
        >
          {#if item.icon}<img src="/icon/{item.icon.src}" alt={item.icon.alt} />{/if}
          {#if item.title}{item.title}{/if}
        </td>
      {/each}
    </tr>
    {#each items as item}
      <tr class="item">
        {#each item.data as data}
          <td
            class:centered={data.centered}
            class:checkbox={data.checkbox}
            on:click={() => {
              if (!data.checkbox) goto(item.href);
            }}
          >
            {#if data.checkbox}
              <Input type="checkbox" checked={item.checked} />
            {:else}
              {data.text}
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

  td {
    padding: 0.4rem 0.5rem;
    white-space: nowrap;
  }
  td.centered {
    text-align: center;
  }
  .item {
    cursor: pointer;
  }
  .item .checkbox {
    background-color: var(--teriary);
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
