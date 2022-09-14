<script>
  import { uuid } from '$lib/utils';
  import Button from '$lib/admin/input/Button.svelte';

  // common
  export let type = 'text';
  export let value = null;
  export let placeholder = null;
  export let edited = false;
  export let disabled = false;
  export let error = null;
  export let borderless = false;

  // number
  export let min = -Infinity;
  export let max = Infinity;
  export let step = 1;
  export let buttons = false;
  const minus = () => (min && value - 1 < min ? () => {} : value--);
  const plus = () => (max && value + 1 > max ? () => {} : value++);

  // textarea
  export let resize = false;
  export let rows = 3;

  // select
  export let options = [];

  // token (for explicit labelling)
  const id = `input-${uuid()}`;
</script>

<div class="wrapper">
  {#if $$slots.default && type != 'checkbox'}
    <label for={id}><slot /></label>
  {/if}

  {#if type == 'text'}
    <input {id} type="text" class:error class:edited class:disabled class:borderless {placeholder} bind:value />
  {:else if type == 'textarea'}
    <textarea
      {id}
      class:error
      class:edited
      class:disabled
      class:borderless
      class:resize
      {placeholder}
      {rows}
      bind:value
    />
  {:else if type == 'email'}
    <input {id} type="email" class:error class:edited class:disabled class:borderless {placeholder} bind:value />
  {:else if type == 'password'}
    <input {id} type="password" class:error class:edited class:disabled class:borderless {placeholder} bind:value />
  {:else if type == 'date'}
    <input {id} type="date" class:error class:edited class:disabled class:borderless {placeholder} bind:value />
  {:else if type == 'time'}
    <input {id} type="time" class:error class:edited class:disabled class:borderless {placeholder} {step} bind:value />
  {:else if type == 'checkbox'}
    <div class="checkbox" class:error class:edited class:disabled on:click={() => (value = !value)}>
      <input {id} bind:checked={value} type="checkbox" />
      {#if $$slots.default}<label for={id} on:click|preventDefault><slot /></label>{/if}
    </div>
  {:else if type == 'select'}
    <select {id} class:error class:edited class:disabled class:borderless {placeholder} bind:value>
      {#each options as option}
        <option value={option.id}>{option.text}</option>
      {/each}
    </select>
  {:else if type == 'number'}
    <div class="number-wrapper" class:buttons>
      {#if buttons}<Button onclick={minus} disabled={value <= min}>&nbsp;-&nbsp;</Button>{/if}
      <div class="number">
        <input
          {id}
          type="number"
          class:error
          class:edited
          class:disabled
          class:borderless
          class:center={buttons}
          {placeholder}
          {min}
          {max}
          {step}
          bind:value
        />
        {#if error}<span class="error-info">{error}</span>{/if}
      </div>
      {#if buttons}<Button onclick={plus} disabled={value >= max}>&nbsp;+&nbsp;</Button>{/if}
    </div>
  {/if}

  {#if error && type != 'number'}
    <span class="error-info">{error}</span>
  {/if}
</div>

<style>
  label {
    display: block;
    margin-bottom: 0.25rem;
  }

  input,
  textarea,
  select,
  .checkbox {
    --edit: solid 1px var(--primary);
    border-radius: 0;
    border: none;
    border: solid 1px var(--accent);
    padding: 0.25rem 0.5rem;
    width: 100%;
    height: 2rem;
    font-size: 0.95rem;
    background-color: var(--light);
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-bottom: var(--edit);
  }
  input.center {
    text-align: center;
  }

  textarea {
    resize: none;
    height: auto;
  }
  textarea.resize {
    resize: both;
  }

  select {
    cursor: pointer;
  }

  .checkbox {
    cursor: pointer;
    display: flex;
    align-items: center;
    outline: none;
    border: none;
    padding: 0;
    height: auto;
    background-color: unset;
  }
  input[type='checkbox'] {
    cursor: pointer;
    margin: 0;
    width: 1.25rem;
    height: 1.25rem;
    accent-color: var(--primary);
  }
  .checkbox:hover input[type='checkbox'] {
    accent-color: var(--primary-light);
  }
  .checkbox label {
    cursor: pointer;
    user-select: none;
    margin: 0;
    margin-left: 0.75rem;
  }

  .number-wrapper {
    display: grid;
    grid-template-columns: auto;
    column-gap: 0.5rem;
  }
  .number-wrapper.buttons {
    grid-template-columns: auto 1fr auto;
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
  .borderless {
    border: none;
  }
</style>
