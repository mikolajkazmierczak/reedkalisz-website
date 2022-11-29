<script>
  import { baseUrl } from '$/api';
  import Icon from '$c/Icon.svelte';

  export let value;
  export let link = false;

  function copy() {
    const copied = link ? `${baseUrl}${value}` : value;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(copied);
    } else {
      alert('Kopiowanie jest obsługiwane tylko przy połączeniach HTTPS.\nSkopiuj link ręcznie.');
      alert(copied);
    }
  }
</script>

<button on:click={copy}>
  <Icon name="copy" />
</button>

<style>
  button {
    cursor: pointer;
    height: 1.25rem;
    width: 1.5rem;
    border-radius: var(--border-radius);
    border: var(--border);
    margin-left: 0.25em;
    padding: 0;
    /* padding: 0.25rem; */
  }
</style>
