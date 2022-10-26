<script>
  import { uuid } from '$lib/utils';
  import Button from '$lib/admin/input/Button.svelte';

  // common
  export let type = 'text';
  export let value = null;
  export let placeholder = null;
  export let disabled = false;
  export let error = null;
  export let borderless = false;
  export let borderRadius = '0';

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
    <input
      {id}
      type="text"
      bind:value
      {placeholder}
      {disabled}
      class:error
      class:borderless
      style:border-radius={borderRadius}
    />
  {:else if type == 'textarea'}
    <textarea {id} bind:value {placeholder} {disabled} class:error class:borderless {rows} class:resize />
  {:else if type == 'email'}
    <input
      {id}
      type="email"
      bind:value
      {placeholder}
      {disabled}
      class:error
      class:borderless
      style:border-radius={borderRadius}
    />
  {:else if type == 'password'}
    <input
      {id}
      type="password"
      bind:value
      {placeholder}
      {disabled}
      class:error
      class:borderless
      style:border-radius={borderRadius}
    />
  {:else if type == 'date'}
    <input
      {id}
      type="date"
      bind:value
      {placeholder}
      {disabled}
      class:error
      class:borderless
      style:border-radius={borderRadius}
    />
  {:else if type == 'time'}
    <input
      {id}
      type="time"
      bind:value
      {placeholder}
      {disabled}
      class:error
      class:borderless
      style:border-radius={borderRadius}
      {step}
    />
  {:else if type == 'checkbox'}
    <div class="checkbox" class:error on:click={() => (value = !value)}>
      <input {id} type="checkbox" bind:checked={value} {disabled} />
      {#if $$slots.default}<label for={id} on:click|preventDefault><slot /></label>{/if}
    </div>
  {:else if type == 'select'}
    <select {id} bind:value {placeholder} {disabled} class:error class:borderless style:border-radius={borderRadius}>
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
          bind:value
          {placeholder}
          {disabled}
          class:error
          class:borderless
          style:border-radius={borderRadius}
          class:center={buttons}
          {min}
          {max}
          {step}
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
    border: solid 1px var(--accent);
    padding: 0.25rem 0.5rem;
    width: 100%;
    height: 2rem;
    font-size: 0.95rem;
    background-color: var(--light);
  }
  [disabled] {
    cursor: not-allowed;
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-bottom: solid 1px var(--primary);
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

  .borderless {
    border: none;
  }
</style>
