<script>
  import { createEventDispatcher } from 'svelte';
  import { nanoid } from 'nanoid';
  import { deep } from '%/utils';
  import Icon from '$c/Icon.svelte';
  import Select from '@c/Select.svelte';
  import ApiBadge from '@c/ApiBadge.svelte';
  import Tooltip from '$c/Tooltip.svelte';

  const dispatch = createEventDispatcher();

  export let input = null;

  // common
  export let type = 'text';
  export let value = null;
  let valueCopy = deep.copy(value); // allows to check for changes from outside
  export let placeholder = null;
  export let disabled = false;
  export let error = null;
  export let invalid = false; // outlined as `error` is, what's wrong said elsewhere (a number field only)
  export let borderless = false;
  export let borderRadius = null; // a field's own (e.g. joined to a button, see Search); else a squircle by its size
  // normal (a cell and a quarter, --control), small (1.5rem, like the small Button), compact (1.2rem, a value in a bar)
  export let size = 'normal';
  export let color = null; // a select's background, e.g. for a status
  export let api = false; // the API scanner sets it: locked, "API" in the field, why when hovered
  export let apiText = 'Tę wartość ustawia skaner API.'; // (a "\n" in it breaks the line)
  export let label = null; // a field labelled by something outside it: its name for screen readers

  // number
  export let min = -Infinity;
  export let max = Infinity;
  export let step = 1;

  // textarea
  export let rows = 3;
  export let format = 'html'; // text, html, markdown, json

  // select (see Select)
  export let options = [];
  export let clearTo = undefined;

  // list
  function parseList(string) {
    try {
      // the typed list (none given: the value's) split on ';' into strings and numbers
      if (string === undefined) string = value === null ? '' : value.join(';');
      const array = string
        .split(';')
        .map((v) => v.trim())
        .filter((v) => v !== '')
        .map((v) => (isNaN(v) ? v : Number(v)));
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
      // typed: the parsed list - only when it says something else (a new array every time would go back and forth
      // with a bound value forever: the parent hands it back, it's "changed", it's parsed again...)
      const array = parseList(list);
      if (array && !deep.same(array, value)) {
        value = array;
        valueCopy = deep.copy(array);
      }
    }
  }

  // token (for explicit labelling; given, for a label of its own outside it: <label for={id}>)
  export let id = `input-${nanoid(6)}`;
</script>

<div class="wrapper {size}" class:locked={api}>
  {#if $$slots.default && type != 'checkbox'}
    <label class="ui-label" for={id}><slot /></label>
  {/if}

  {#if type == 'text'}
    <input
      {id}
      type="text"
      aria-label={label}
      bind:value
      bind:this={input}
      {placeholder}
      {disabled}
      class:error
      class:borderless
      style:border-radius={borderRadius}
      on:click={(e) => dispatch('click', { e })}
      on:input={(e) => dispatch('input', { e })}
      on:blur />
  {:else if type == 'textarea'}
    <textarea
      {id}
      bind:value
      {placeholder}
      {disabled}
      class:error
      class:borderless
      {rows}
      class:json={format === 'json'}
      on:click={(e) => dispatch('click', { e })}
      on:input={(e) => dispatch('input', { e })}
      on:blur />
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
      on:click={(e) => dispatch('click', { e })}
      on:input={(e) => dispatch('input', { e })}
      on:blur />
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
      on:click={(e) => dispatch('click', { e })}
      on:input={(e) => dispatch('input', { e })}
      on:blur />
  {:else if type == 'checkbox'}
    <label class="checkbox" class:error class:disabled>
      <input {id} type="checkbox" aria-label={label} bind:checked={value} bind:this={input} {disabled} />
      {#if $$slots.default}<span class="checkbox__label"><slot /></span>{/if}
    </label>
  {:else if type == 'select'}
    <Select
      {id}
      {label}
      bind:value
      bind:button={input}
      {options}
      {placeholder}
      {clearTo}
      {disabled}
      {size}
      {color}
      {error}
      {borderless}
      {borderRadius}
      on:change />
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
          style:border-radius={borderRadius} />
        <!-- over the field, not the items below it -->
        {#if api}
          <span class="api"><ApiBadge /><Tooltip><small style:white-space="pre-line">{apiText}</small></Tooltip></span>
        {/if}
      </div>
      <div class="list-items">
        {#if Array.isArray(value)}
          {#each value as v, i}
            <button
              class="list-items__item"
              {disabled}
              on:click={() => {
                value.splice(i, 1);
                list = value.join(';');
                value = value;
              }}>
              {v}
              {#if !disabled}<div class="icon"><Icon fill name="close" /></div>{/if}
            </button>
          {/each}
        {/if}
      </div>
    </div>
  {:else if type == 'number'}
    <div class="number-wrapper">
      <div class="number">
        <input
          {id}
          type="number"
          aria-label={label}
          bind:value
          bind:this={input}
          {placeholder}
          {disabled}
          class:error={error || invalid}
          class:borderless
          style:border-radius={borderRadius}
          {min}
          {max}
          {step}
          on:click={(e) => dispatch('click', { e })}
          on:input={(e) => dispatch('input', { e })}
          on:blur />
        {#if error}<span class="error-info">{error}</span>{/if}
      </div>
    </div>
  {/if}

  {#if error && type != 'number'}
    <span class="error-info">{@html error}</span>
  {/if}

  <!-- over the whole field (a disabled one gets no pointer), the badge at its right end -->
  {#if api && type != 'list'}
    <span class="api" class:select={type == 'select'} class:textarea={type == 'textarea'}>
      <ApiBadge /><Tooltip><small style:white-space="pre-line">{apiText}</small></Tooltip>
    </span>
  {/if}
</div>

<style>
  .wrapper {
    position: relative;
    min-width: 0; /* in a grid's column (ui-pair) as narrow as the column: a long value is cut, not widening it */
  }
  /* the fields are a form's cells: a ruled box a shade brighter than the ply, its bottom edge darker - the line it's
     written on; squircles (rounded, where corner-shape isn't known), smaller ones less rounded */
  input,
  textarea,
  .checkbox {
    border: solid 1px var(--edge);
    border-bottom-color: var(--edge-line);
    border-radius: var(--field-radius);
    corner-shape: squircle;
    padding: 0.25rem 0.5rem;
    width: 100%;
    height: var(--control);
    font-size: 0.95rem;
    background-color: var(--paper-field);
  }
  [disabled] {
    cursor: not-allowed;
  }
  /* faded, as a disabled select */
  input:not([type='checkbox'])[disabled],
  textarea[disabled] {
    opacity: 0.6;
  }
  /* a hint, not a value: faint (navy seen through, on any box) */
  input::placeholder,
  textarea::placeholder {
    color: rgb(27 47 78 / 0.4);
  }

  /* under the pointer the border darkens, as a checkbox's; in focus darker still */
  input:not([type='checkbox']),
  textarea {
    transition:
      border-color 100ms,
      box-shadow 100ms;
  }
  input:not([type='checkbox'], [disabled]):hover,
  textarea:not([disabled]):hover {
    border-color: var(--navy-500);
  }
  input:focus,
  textarea:focus,
  input:focus:hover,
  textarea:focus:hover {
    outline: none;
    border-color: var(--navy-700);
    box-shadow: var(--shadow-focus);
  }
  input[type='checkbox']:focus {
    box-shadow: none;
  }
  textarea {
    resize: none;
    height: auto;
  }
  textarea.json {
    font-family: monospace;
    font-size: 0.9rem;
  }

  .checkbox {
    cursor: pointer;
    display: flex;
    align-items: center;
    outline: none;
    border: none;
    margin: 0;
    padding: 0;
    height: auto;
    background-color: unset;
  }
  .checkbox.disabled {
    cursor: not-allowed;
  }
  /* a squircle as the website's (its consent box): navy with a white tick when ticked */
  input[type='checkbox'] {
    flex: none;
    cursor: pointer;
    appearance: none;
    display: grid;
    place-items: center;
    margin: 0;
    padding: 0;
    width: 1.25rem;
    height: 1.25rem;
    border: solid 1px var(--edge-line);
    border-radius: var(--field-radius-small);
    background-color: var(--paper-field);
    /* ticked or not at once: a fade, caught midway by the next click (clicking fast), reads as one toggle too many -
       only the pointer's border eases */
    transition: border-color 100ms;
  }
  input[type='checkbox']::after {
    content: '';
    width: 75%;
    height: 75%;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 8.5l3.25 3.25L13 5' fill='none' stroke='%23fff' stroke-width='2.25' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
      center / contain no-repeat;
    opacity: 0;
  }
  .checkbox:hover input[type='checkbox'] {
    border-color: var(--navy-500);
  }
  input[type='checkbox']:checked {
    border-color: var(--navy-700);
    background-color: var(--navy-700);
  }
  .checkbox:hover input[type='checkbox']:checked {
    border-color: var(--navy-500);
    background-color: var(--navy-500);
  }
  input[type='checkbox']:checked::after {
    opacity: 1;
  }
  input[type='checkbox']:focus-visible {
    outline: solid 2px var(--navy-500);
    outline-offset: 1px;
  }
  input[type='checkbox'][disabled] {
    cursor: not-allowed;
    border-color: var(--edge);
    background-color: var(--grey-100);
  }
  input[type='checkbox'][disabled]:checked::after {
    filter: invert(0.5);
  }
  .checkbox__label {
    user-select: none;
    margin-left: 0.75rem;
  }
  /* in a box a row of its own a cell tall (see .ui-box) */
  :global(.ui-box) .checkbox {
    min-height: var(--cell);
  }

  .list {
    position: relative;
  }
  /* the tags under the field: a little space above and below, lined up with its edges */
  .list-items {
    display: flex;
    flex-wrap: wrap;
    padding-top: 0.25rem;
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
    corner-shape: squircle;
    border: none;
    height: 1.25rem;
    font-size: 0.75rem;
    color: var(--text);
    opacity: 0.8;
    background-color: var(--black-10);
  }
  .list-items__item:hover:not(:disabled) {
    background-color: var(--black-20);
  }
  .list-items__item:disabled {
    cursor: default;
    padding-right: 0.5rem; /* no cross */
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

  .error {
    outline: solid 2px var(--red-500);
  }
  .error-info {
    display: inline-block; /* allows to put an optional <br> after the input to minimize content shift */
    margin-top: 0.25rem;
    margin-left: 0.75rem;
    color: var(--red-500);
  }

  .small input:not([type='checkbox']) {
    padding: 0 0.35rem;
    height: 1.5rem;
    border-radius: var(--field-radius-small);
    font-size: 0.85rem;
  }
  .small input[type='checkbox'] {
    width: 1rem;
    height: 1rem;
    border-radius: var(--field-radius-compact);
  }
  .small .checkbox__label {
    margin-left: 0.4rem;
    font-size: var(--label-size, 0.85rem); /* a surrounding bar can set its own */
  }
  .compact input:not([type='checkbox']) {
    padding: 0 0.3rem;
    height: 1.2rem;
    border-radius: var(--field-radius-compact);
    font-size: 0.85rem;
  }

  /* in a table's cell (the calculations): square, the cell draws the lines - whatever its size */
  .wrapper input.borderless,
  .wrapper textarea.borderless {
    border: none;
    border-radius: 0;
  }

  /* the field's last line (a label may be above it), the badge at its right end, before a select's arrow */
  .api {
    --field: var(--control);
    z-index: 1;
    cursor: help;
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding-right: 0.3rem;
  }
  .small .api {
    --field: 1.5rem;
  }
  .compact .api {
    --field: 1.2rem;
  }
  .api > :global(.api-badge) {
    margin-bottom: calc((var(--field) - 1.4rem) / 2);
    box-shadow: none; /* the field is its frame */
  }
  .locked input:not([type='checkbox']),
  .locked textarea {
    padding-right: 2.25rem; /* the value clear of the badge */
  }
  .locked :global(button.select) {
    padding-right: 3.5rem; /* (the badge before the arrow) */
  }
  .api.select {
    padding-right: 1.8rem;
  }
  .api.textarea > :global(.api-badge) {
    margin-bottom: 0.3rem;
  }
</style>
