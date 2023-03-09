<script>
  import Color from '#c/Color.svelte';
  import Gallery from './Gallery.svelte';

  export let code;
  export let storage;
  const { api_color_code, amount, img, color_first, color_second, multicolored } = storage;
</script>

<div class="storage">
  <div class="code">
    <Color {amount} first={color_first} second={color_second} {multicolored} />
    <h3>
      <small>{code}{api_color_code}</small>
      <div class="color">
        {#if multicolored}
          <span>WIELOKOROWY</span>
        {:else if color_first || color_second}
          {#if color_first}
            <span>
              {color_first.name}
              {#if color_second}&nbsp;/{/if}
            </span>
          {/if}
          {#if color_second}<br /><span>{color_second.name}</span>{/if}
        {/if}
      </div>
    </h3>
  </div>

  <!-- <div class="amount"><small>Ilość:</small> {@html amount ?? '<small>Na stanie</small>'}</div> -->

  <Gallery imgs={img.filter(img => img.enabled)} small />
</div>

<style>
  .storage {
    display: flex;
    flex-direction: column;
    /* border-radius: 10px; */
    /* border: 1px solid rgba(0, 0, 0, 0.1); */
    padding: 0.5rem;
    width: calc((100% - 1rem) / 2);
    background-color: rgb(250, 250, 250);
  }

  .storage .code {
    white-space: nowrap;
    display: grid;
    grid-template-columns: 20px 1fr;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .storage h3 {
    display: flex;
    flex-direction: column;
  }
  .storage .color {
    font-size: x-small;
    font-weight: normal;
    text-transform: uppercase;
  }

  .storage .amount {
    white-space: nowrap;
    margin: 0.5rem 0;
    opacity: 0.8;
  }
</style>
