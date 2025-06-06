<script>
  import striptags from 'striptags';

  export let html = '';

  function cleanHtml(htmlString) {
    return striptags(htmlString, ['div', 'br']); // remove all html other than <br> and <div>
  }

  $: html = cleanHtml(html);
</script>

<span role="textbox" tabindex="0" contenteditable bind:innerHTML={html} />

<style>
  span {
    display: block;
    color: inherit;
  }
</style>
