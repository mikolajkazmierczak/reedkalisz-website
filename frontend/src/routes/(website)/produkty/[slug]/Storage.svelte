<script>
  import AdminOnlyOverlay from '#c/AdminOnlyOverlay.svelte';
  import Color from '#c/Color.svelte';
  import Gallery from './Gallery.svelte';

  export let company;
  $: codeSeparator = getCodeSeparator(company);

  export let code;
  export let storage;
  $: ({ enabled, amount, multicolored, api_color_code, color_first, color_second, img } = storage);

  function getCodeSeparator(company) {
    switch (company?.name) {
      case 'PAR':
        return '.';
      case 'MidOcean':
        return '-';
      default:
        return '';
    }
  }
</script>

<div class="storage">
  <AdminOnlyOverlay show={!enabled} />

  <div class="badge">
    <div class="swatch">
      <Color {multicolored} first={color_first} second={color_second} {amount} size="2rem" />
    </div>
    <h3>
      <small class="code">{code}{api_color_code ? codeSeparator : ''}{api_color_code}</small>
      <div class="color">
        {#if multicolored}
          <span>WIELOKOLOROWY</span>
        {:else if color_first || color_second}
          {#if color_first}
            {color_first.name}
            {#if color_second}&nbsp;/&nbsp;{/if}
          {/if}
          {#if color_second}
            {color_second.name}
          {/if}
        {/if}
      </div>
    </h3>
  </div>

  <div class="amount">
    <small>Dostępność:</small>
    {#if amount == 0}
      <b><small class="empty">BRAK</small></b>
    {:else if amount}
      {amount}
    {:else}
      <b><small>ZAPYTAJ</small></b>
    {/if}
  </div>

  <Gallery small imgs={img} />
</div>

<style>
  .storage {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0;
    width: calc((100% - 1rem) / 2);
  }

  .badge {
    white-space: nowrap;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  h3 {
    display: flex;
    flex-direction: column;
  }
  .swatch {
    margin-top: 0.05rem;
  }
  .color {
    font-size: x-small;
    font-weight: normal;
    text-transform: uppercase;
  }

  .amount {
    white-space: nowrap;
    margin-left: 1.25rem;
    margin-bottom: 0.5rem;
    opacity: 0.8;
  }
  .empty {
    color: var(--main);
  }
</style>
