<script>
  export let type = 'text';
  export let value = '';
  export let checked = false;
  export let placeholder = null;
</script>

{#if type == 'checkbox'}
  <label class="checkbox" class:center={!$$slots.default}>
    <input type="checkbox" {placeholder} bind:checked />
    {#if $$slots.default}
      <span><slot /></span>
    {/if}
  </label>
{:else if type == 'password'}
  <label class="password">
    <span><slot /></span>
    <input type="password" {placeholder} bind:value />
  </label>
{:else}
  <label class="text">
    <span><slot /></span>
    <input type="text" {placeholder} bind:value />
  </label>
{/if}

<style>
  label {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: start;
  }
  label.checkbox {
    flex-flow: row;
    justify-content: start;
    align-items: center;
  }
  label.center {
    justify-content: center;
  }

  span {
    display: block;
    padding: 0.5rem;
  }

  input {
    border-radius: 0;
    border: solid 1px var(--grey-light);
    padding: 0 0.5rem;
    width: 100%;
    height: 2rem;
    font-size: 0.95rem;
  }

  input[type='checkbox'] {
    cursor: pointer;
    margin: 0;
    width: 16px;
    height: 16px;
    border: none;
    accent-color: var(--main-1);
  }
</style>
