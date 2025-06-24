<script>
  import { parseHref } from '#/layout/utils';

  export let type = 'text';
  export let label;

  export let value;
  export let placeholder = '';

  export let options = [];

  $: if (type === 'uri') {
    // replace with parsed uri (url or pathname)
    const { href } = parseHref(value);
    if (href) value = href;
  }
</script>

<label for={label}>{label}</label>

{#if type === 'text' || type === 'uri'}
  <input name={label} type="text" bind:value {placeholder} />
{:else if type === 'select'}
  <select name={label} bind:value>
    {#each options as { id, text }}
      <option value={id}>{text}</option>
    {/each}
  </select>
{/if}

<style>
  label {
    font-size: 0.8rem;
    color: var(--text);
    text-transform: uppercase;
  }
  input {
    margin: 0;
    border: none;
    padding: 0;
    height: 1.25rem;
    background-color: var(--main-0);
  }
</style>
