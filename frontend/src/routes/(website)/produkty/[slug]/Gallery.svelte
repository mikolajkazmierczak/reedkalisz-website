<script>
  import { fly } from 'svelte/transition';
  import { baseUrl } from '$/api';
  import AdminOnlyOverlay from '#c/AdminOnlyOverlay.svelte';

  export let imgs;
  $: index = imgs.length ? 0 : null;
  $: main = imgs.length ? imgs[index] : null;
  $: showPicker = imgs.length !== 1;

  export let small = false;

  let lightbox = { open: false, img: null };

  const openLightbox = i => (lightbox = { open: true, img: imgs[i] });
  const closeLightbox = () => (lightbox.open = false);
</script>

{#if imgs.length}
  {#if lightbox.img}
    {@const { open, img } = lightbox}
    <button class="lightbox" class:open on:click={closeLightbox}>
      <img src="{baseUrl}/assets/{img.img}" alt={img.alt} />
    </button>
  {/if}

  <div class="gallery">
    <div class="main" class:only={!showPicker}>
      <button class="main__button" on:click={() => openLightbox(index)}>
        {#key main}
          <img src="{baseUrl}/assets/{main.img}" alt={main.alt} in:fly={{ y: 20, duration: 200 }} />
        {/key}
        <AdminOnlyOverlay show={!main.enabled} />
      </button>
    </div>

    {#if showPicker}
      <div class="picker" class:small>
        {#each imgs as { enabled, img, alt }, i}
          <button class="picker__button" on:mouseenter={() => (index = i)} on:click={() => openLightbox(i)}>
            <img src="{baseUrl}/assets/{img}" {alt} />
            <AdminOnlyOverlay show={!enabled} padding="5%" />
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  button {
    position: relative;
    cursor: zoom-in;
    margin: 0;
    padding: 0;
    border: none;
    background-color: transparent;
  }
  img {
    display: block;
    width: 100%;
    object-fit: contain;
    aspect-ratio: 1 / 1;
  }

  .lightbox {
    cursor: zoom-out;
    position: fixed;
    top: 0;
    left: 0;
    display: none;
    place-items: center;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 100;
  }
  .lightbox.open {
    display: grid;
  }
  .lightbox img {
    max-width: 90vh;
    max-height: 90vh;
    object-fit: contain;
  }

  .gallery {
    --border: 1px solid rgba(0, 0, 0, 0.1);
    --radius: 0;
    width: 100%;
    background-color: #fff;
  }

  .main {
    overflow: hidden;
    border-radius: var(--radius) var(--radius) 0 0;
    border: var(--border);
    padding: 5%;
    width: 100%;
    aspect-ratio: 1 / 1;
  }
  .main.only {
    border-radius: var(--radius);
  }

  .picker {
    overflow: hidden;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    border-radius: 0 0 var(--radius) var(--radius);
    border: var(--border);
    border-top: none;
    padding: 0 5%;
  }
  .picker.small {
    grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));
  }
  .picker__button {
    padding: 5%;
    background-color: #fff;
  }
</style>
