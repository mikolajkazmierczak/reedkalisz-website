<script>
  import Button from '@c/Button.svelte';
  import Input from '@c/Input.svelte';

  import { parseHref } from '#/layout/utils';

  // Where a button leads: a page of the website (/kategorie/…) or a whole address; opened in a new tab to check it.
  export let uri = '';

  $: ({ href } = parseHref(uri));
</script>

<div class="link">
  <Input type="text" bind:value={uri} placeholder="/kategorie/…">Link</Input>
  <Button
    icon="open"
    secondary
    edge
    title={href ? 'Otwórz w nowej karcie' : 'Najpierw wpisz link'}
    disabled={!href}
    on:click={() => window.open(href, '_blank', 'noopener')} />
</div>

<style>
  .link {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    gap: var(--quarter);
  }
</style>
