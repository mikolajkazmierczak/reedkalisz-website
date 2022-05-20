<script>
  import Button from '$lib/admin/Button.svelte';

  export let type = 'text';
  export let value;
  export let placeholder;
  export let edited = false;
  export let disabled = false;

  export let error = null;

  export let min = null;
  export let max = null;
  export let step = null;
  export let buttons = false;

  const minus = () => (min && value - 1 < min ? () => {} : value--);
  const plus = () => (max && value + 1 > max ? () => {} : value++);

  const token = () => Math.random().toString(36).substring(2);
  const id = `input-${token()}`; // token for explicit labelling
</script>

<div class="wrapper">
  {#if $$slots.default && type != 'checkbox'}
    <label for={id}><slot /></label>
  {/if}

  {#if type == 'text'}
    <input {id} class:error class:edited class:disabled bind:value type="text" {placeholder} />
  {:else if type == 'email'}
    <input {id} class:error class:edited class:disabled bind:value type="email" {placeholder} />
  {:else if type == 'password'}
    <input {id} class:error class:edited class:disabled bind:value type="password" {placeholder} />
  {:else if type == 'date'}
    <input {id} class:error class:edited class:disabled bind:value type="date" {placeholder} />
  {:else if type == 'time'}
    <input {id} class:error class:edited class:disabled {step} bind:value type="time" {placeholder} />
  {:else if type == 'checkbox'}
    <div class="checkbox" class:error class:edited class:disabled on:click={() => (value = !value)}>
      <input {id} bind:checked={value} type="checkbox" />
      {#if $$slots.default}<label for={id} on:click|preventDefault><slot /></label>{/if}
    </div>
  {:else if type == 'number'}
    <div class="number-wrapper">
      {#if buttons}<Button onclick={minus} disabled={value <= min}>-</Button>{/if}
      <div class="number">
        <input
          {id}
          class:error
          class:edited
          class:disabled
          class:center={buttons}
          {min}
          {max}
          {step}
          bind:value
          type="number"
          {placeholder}
        />
        {#if error}<span class="error-info">{error}</span>{/if}
      </div>
      {#if buttons}<Button onclick={plus} disabled={value >= max}>+</Button>{/if}
    </div>
  {/if}

  {#if error && type != 'number'}
    <span class="error-info">{error}</span>
  {/if}
</div>

<style>
  label {
    display: block;
    margin: 0.5rem 0;
    color: #fff;
  }

  input,
  .checkbox {
    --edit: solid 1px var(--main);
    border-radius: 0;
    border: solid 1px var(--grey-light);
    padding: 0 0.5rem;
    width: 100%;
    height: 2rem;
    font-size: 0.95rem;
  }

  input:focus {
    border: var(--edit);
    outline: none;
  }
  input.center {
    text-align: center;
  }

  .checkbox {
    display: flex;
    align-items: center;
  }
  input[type='checkbox'] {
    width: 1.75rem;
    height: 1.75rem;
    margin-right: 1rem;
    accent-color: var(--main);
  }

  .number-wrapper {
    display: grid;
    grid-template-columns: auto 1fr auto;
    column-gap: 1rem;
  }

  .error {
    outline: solid 2px var(--main);
  }
  .error-info {
    display: inline-block; /* allows to put an optional <br> after the input to minimize content shift */
    margin-top: 0.25rem;
    margin-left: 0.75rem;
    color: var(--main);
  }

  .edited {
    border: var(--edit);
  }
</style>
