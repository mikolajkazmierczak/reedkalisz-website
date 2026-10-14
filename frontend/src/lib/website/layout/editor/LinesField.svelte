<script>
  import Input from '@c/Input.svelte';

  import { toText, toHtml } from '#/layout/editor/text';

  // A banner's or a title's text: kept as HTML (see text.js), typed as plain lines, each a line on the page.
  export let html = '';
  export let rows = 2;
  export let placeholder = null;

  let text = toText(html);
  let typed = html; // what was last written from here: anything else came from elsewhere, and is shown
  $: if (html !== typed) {
    typed = html;
    text = toText(html);
  }

  function write() {
    typed = html = toHtml(text);
  }
</script>

<Input type="textarea" bind:value={text} {rows} {placeholder} on:input={write}><slot /></Input>
