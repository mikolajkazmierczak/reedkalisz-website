<script>
  import { nanoid } from 'nanoid';
  import { deep } from '%/utils';
  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import Button from '@c/Button.svelte';

  export let input = null;

  // common
  export let type = 'text';
  export let value = null;
  let valueCopy = deep.copy(value); // allows to check for changes from outside
  export let placeholder = null;
  export let disabled = false;
  export let error = null;
  export let borderless = false;
  export let borderRadius = '0';
  export let api = false; // whether the value will be updated via api

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

  // list
  function parseList(string) {
    try {
      // Parse comma separated list to strings and numbers array.
      // set value in editor
      if (string === undefined) string = value === null ? '' : value.join(';');
      const array = string
        .split(';')
        .map(v => v.trim())
        .filter(v => v !== '')
        .map(v => (isNaN(v) ? v : Number(v)));
      // check if values are allowed
      for (const v of array) {
        if (listDisallowNumbers && !isNaN(v)) throw new TypeError('Wartości nie mogą być liczbowe');
        if (listDisallowString && isNaN(v)) throw new TypeError('Wartości muszą być liczbowe');
        if (listDisallowNegative && v < 0) throw new TypeError('Mniej niż zerooo');
        if (listDisallowZero && v == 0) throw new TypeError('Wartość nie może być zerem');
      }
      error = null;
      return array;
    } catch (e) {
      error = e.message;
    }
  }
  let list;
  export let listDisallowNumbers = false;
  export let listDisallowString = false;
  export let listDisallowNegative = false;
  export let listDisallowZero = false;

  $: if (type == 'list') {
    if (list === undefined && value !== null) list = value.join(';');
    if (!deep.same(value, valueCopy)) {
      // value changed from outside
      list = value === null ? '' : value.join(';');
      valueCopy = deep.copy(value);
    } else {
      const array = parseList(list);
      if (array) value = array;
    }
  }

  // token (for explicit labelling)
  const id = `input-${nanoid(6)}`;
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
      bind:this={input}
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
      bind:this={input}
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
      bind:this={input}
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
      bind:this={input}
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
      bind:this={input}
      {placeholder}
      {disabled}
      class:error
      class:borderless
      style:border-radius={borderRadius}
      {step}
    />
  {:else if type == 'color'}
    <input
      {id}
      type="color"
      bind:value
      bind:this={input}
      {disabled}
      class:error
      class:borderless
      style:border-radius={borderRadius}
    />
  {:else if type == 'checkbox'}
    <div class="checkbox" class:error on:click={() => (value = !value)} on:keydown={() => {}}>
      <input {id} type="checkbox" bind:checked={value} bind:this={input} {disabled} />
      {#if $$slots.default}<label for={id} on:click|preventDefault on:keydown={() => {}}><slot /></label>{/if}
    </div>
  {:else if type == 'select'}
    <select
      {id}
      bind:value
      bind:this={input}
      {placeholder}
      {disabled}
      class:error
      class:borderless
      style:border-radius={borderRadius}
    >
      {#each options as option}
        <option value={option.id}>{option.text}</option>
      {/each}
    </select>
  {:else if type == 'list'}
    <div class="list-wrapper">
      <div class="list">
        <input
          {id}
          type="text"
          bind:value={list}
          bind:this={input}
          {placeholder}
          {disabled}
          class:error
          class:borderless
          style:border-radius={borderRadius}
        />
        <!-- <button class="list__tidy" on:click={() => (list = value.join(';'))} title="Uporządkuj">
          <Icon name="broom" />
        </button> -->
      </div>
      <div class="list-items">
        {#if Array.isArray(value)}
          {#each value as v, i}
            <button
              class="list-items__item"
              on:click={() => {
                value.splice(i, 1);
                list = value.join(';');
                value = value;
              }}
            >
              {v}
              <div class="icon"><Icon name="close" /></div>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  {:else if type == 'number'}
    <div class="number-wrapper" class:buttons>
      {#if buttons}<Button onclick={minus} disabled={value <= min}>&nbsp;-&nbsp;</Button>{/if}
      <div class="number">
        <input
          {id}
          type="number"
          bind:value
          bind:this={input}
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
    <span class="error-info">{@html error}</span>
  {/if}

  {#if api}
    <div class="api-icon">
      <Tooltip label="Ta wartość będzie aktualizowana przez API" />
      <Icon name="api" light />
    </div>
  {/if}
</div>

<style>
  .wrapper {
    position: relative;
  }
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

  .list {
    position: relative;
  }
  /* .list__tidy {
    cursor: pointer;
    position: absolute;
    top: 5px;
    right: 5px;
    aspect-ratio: 1 / 1;
    border-radius: var(--border-radius);
    border: none;
    padding: 0.2rem;
    height: calc(100% - 10px);
    font-size: 0.75rem;
    color: #000;
    opacity: 0.75;
    background-color: rgba(0, 0, 0, 0.1);
  }
  .list__tidy:hover {
    background-color: var(--accent-light);
  } */
  .list-items {
    display: flex;
    flex-wrap: wrap;
    position: relative;
    left: 1px;
    border-radius: 0 0 var(--border-radius) var(--border-radius);
    padding-top: 0.25rem;
    padding-left: 0.25rem;
    width: calc(100% - 2px);
    background-color: rgba(255, 255, 255, 0.5);
  }
  .list-items__item {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-right: 0.25rem;
    margin-bottom: 0.25rem;
    padding: 0.25rem 0.5rem;
    padding-right: 0.25rem;
    border-radius: var(--border-radius);
    border: none;
    height: 1.25rem;
    font-size: 0.75rem;
    color: #000;
    opacity: 0.8;
    background-color: rgba(0, 0, 0, 0.1);
  }
  .list-items__item:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
  .list-items__item .icon {
    display: inline-block;
    height: 0.75rem;
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

  .api-icon {
    cursor: help;
    position: absolute;
    bottom: calc(-1.25rem / 2);
    left: calc(-1.25rem / 2);
    /* transform: translate(-50%, 50%); cannot be used, Tooltip would be shifted */
    width: 1.25rem;
    height: 1.25rem;
    padding: 0.1rem;
    background-color: var(--accent-dark);
    border-radius: 50%;
  }
</style>
