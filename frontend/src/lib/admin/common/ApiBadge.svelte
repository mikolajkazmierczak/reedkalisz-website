<script>
  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';

  // Marks what the API scanner keeps in line with the supplier: the robot in a circle ringed as a colour swatch.
  // `edited`: changed here, so the scanner leaves it be (a red cross in place of the robot) - a button then: a click
  // brings back `restore`, the API's value (the owner sets it). `text`: its tooltip (none: the owner shows one).
  export let text = null;
  export let edited = false;
  export let restore = null;
</script>

{#if edited}
  <button type="button" class="api-badge edited" aria-label={text ?? 'API'} on:click>
    <Icon name="close" width="0.7rem" height="0.7rem" color="var(--red-500)" />
    {#if text}
      <Tooltip>
        <small>
          {text}
          {#if restore}<br />Kliknij, żeby przywrócić: <b>{restore}</b>{/if}
        </small>
      </Tooltip>
    {/if}
  </button>
{:else}
  <span class="api-badge" aria-label={text ?? 'API'}>
    <Icon name="api" width="1.1rem" height="1.1rem" color="var(--blue-700)" />
    {#if text}<Tooltip><small>{text}</small></Tooltip>{/if}
  </span>
{/if}

<style>
  /* ringed as the colour swatches (see Select), the robot blue as the category codes; clear, only what's under it
     blurred */
  .api-badge {
    cursor: help;
    display: inline-grid;
    flex-shrink: 0;
    place-items: center;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px var(--black-20);
    -webkit-backdrop-filter: blur(0.25rem);
    backdrop-filter: blur(0.25rem);
  }
  .edited {
    cursor: pointer;
    padding: 0;
    border: none;
    background-color: transparent;
  }
  .edited:hover {
    background-color: var(--blue-100);
  }
</style>
