<script>
  import Icon from '$c/Icon.svelte';

  import { parseUri } from '#/layout/utils';
  import Input from '#/layout/Input.svelte';

  export let button;
  export let uri;

  $: ({ href } = parseUri(uri));
</script>

<Input label="Przycisk" bind:value={button} />
<div />
<Input label="Link" type="uri" bind:value={uri} />
<a {href} target="_blank" class="uri" class:disabled={!href}>
  <Icon name={href ? 'open' : 'open_off'} width="1rem" color="var(--main-4)" />
</a>

<style>
  .uri {
    cursor: pointer;
    display: flex;
    gap: 0.5rem;
    border: 1px solid var(--main-4);
    padding: 0 0.25rem;
    height: 1.25rem;
    font-size: 0.8rem;
    background-color: var(--main-1);
  }
  .uri:not(.disabled):hover {
    background-color: var(--main-0);
  }
  .uri.disabled {
    cursor: not-allowed;
  }
</style>
