<script>
  import { fly } from 'svelte/transition';
  import { baseUrl } from '$/api';
  import Lightbox from './Lightbox.svelte';

  export let imgs = [];
  export let variant = null; // all the photos' variant (a variant's card); else each photo's own, if any
  /** Product name, for alt text. */
  export let alt = '';
  export let small = false;

  // A disabled image is disabled for everyone, admin included.
  $: shown = imgs.filter((i) => i.img && i.enabled !== false);
  $: index = shown.length ? 0 : null;
  $: (shown, (zoomed = null)); // another product's photos (back/forward reuses the page) close the lightbox
  $: main = shown.length ? shown[index] : null;

  // Variant cards show thumbnails only; a single image needs no strip.
  $: showMain = !small;
  $: showPicker = small ? shown.length > 0 : shown.length !== 1;

  const label = (i) => (shown.length > 1 ? `${alt} — zdjęcie ${i + 1} z ${shown.length}` : alt);

  // The lightbox takes focus and returns it on close, leaving the main photo at the one looked at last.
  let zoomed = null;
  let opener = null;
  function openLightbox(i) {
    opener = document.activeElement;
    zoomed = i;
  }
  function closeLightbox(e) {
    if (zoomed == null) return; // (a second close while it fades away)
    index = e.detail;
    zoomed = null;
    opener?.focus?.({ preventScroll: true });
  }
  $: photos = variant ? shown.map((i) => ({ ...i, variant })) : shown;
</script>

{#if shown.length}
  {#if zoomed != null}
    <Lightbox imgs={photos} index={zoomed} {label} on:close={closeLightbox} />
  {/if}

  <div class="gallery">
    {#if showMain}
      <div class="main" class:only={!showPicker}>
        <button class="main__button" type="button" on:click={() => openLightbox(index)}>
          {#key main}
            <img
              src="{baseUrl}/assets/{main.img}"
              alt={label(index)}
              draggable="false"
              in:fly={{ y: 20, duration: 200 }} />
          {/key}
        </button>
      </div>
    {/if}

    {#if showPicker}
      <div class="picker" class:small>
        {#each shown as { img }, i}
          <button
            class="picker__button"
            type="button"
            aria-label="Powiększ: {label(i)}"
            on:mouseenter={() => (index = i)}
            on:click={() => openLightbox(i)}>
            <img src="{baseUrl}/assets/{img}" alt="" loading="lazy" decoding="async" draggable="false" />
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .gallery {
    display: flex;
    flex-direction: column;
    gap: var(--sp-3);
  }

  button {
    position: relative;
    margin: 0;
    padding: 0;
    border: none;
    background-color: transparent;
    cursor: zoom-in;
  }

  .main {
    position: relative;
    aspect-ratio: 1 / 1;
    border: 1px solid var(--border);
    background-color: var(--surface);
    overflow: hidden;
  }
  .main__button {
    display: block;
    width: 100%;
    height: 100%;
  }
  .main__button img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    mix-blend-mode: multiply;
  }

  .picker {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(3.5rem, 1fr));
    gap: var(--sp-2);
  }
  .picker__button {
    aspect-ratio: 1 / 1;
    padding: var(--sp-1);
    border: 1px solid var(--border);
    background-color: var(--surface);
    cursor: zoom-in;
  }
  /* Instant 2× zoom on hover (a tween jitters); pointer devices only. */
  @media (hover: hover) {
    .picker__button:hover {
      z-index: 2;
      transform: scale(2);
      border-color: var(--ink);
      box-shadow: 0 0.25rem 1rem rgba(17, 17, 16, 0.18);
    }
  }
  .picker__button img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    mix-blend-mode: multiply;
  }

  @media (min-width: 56.25rem) {
    .picker {
      grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr));
    }
  }
</style>
