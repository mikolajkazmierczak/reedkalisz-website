<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { portal } from '@/portal';
  import Icon from '$c/Icon.svelte';
  import Loader from '$c/Loader.svelte';

  // An image's original over the page, as big as it is (the window at most). A click anywhere or Escape closes it
  // (on:close) - Escape this only, not a modal it's over (heard first, in the capture phase).
  export let src;
  const dispatch = createEventDispatcher();
  const close = () => dispatch('close');

  let loaded = false;
  $: (src, (loaded = false));

  function onKey(e) {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation();
    close();
  }
  onMount(() => {
    addEventListener('keydown', onKey, true);
    return () => removeEventListener('keydown', onKey, true);
  });
</script>

<div class="lightbox" role="presentation" use:portal on:click={close} transition:fade={{ duration: 150 }}>
  {#if !loaded}<span class="loader"><Loader /></span>{/if}
  <img class:loaded {src} alt="" on:load={() => (loaded = true)} />
  <button type="button" class="close" aria-label="Zamknij" on:click={close}>
    <Icon fill name="close" color="var(--light)" />
  </button>
</div>

<style>
  /* over everything (the editor 100, the popups 1000, the dialogs 1500), under tooltips */
  .lightbox {
    z-index: 1800;
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 2rem;
    cursor: zoom-out;
    background-color: rgb(0 0 0 / 0.75);
  }
  img {
    grid-area: 1 / 1;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: calc(100dvh - 4rem);
    object-fit: contain;
    border-radius: var(--border-radius);
    corner-shape: squircle;
    background-color: var(--light); /* a see-through png on white, as on the website */
    opacity: 0;
  }
  img.loaded {
    opacity: 1;
  }
  .loader {
    grid-area: 1 / 1;
    width: 2rem;
  }
  .close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.6rem;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    background-color: rgb(255 255 255 / 0.15);
  }
  .close:hover {
    background-color: rgb(255 255 255 / 0.3);
  }
</style>
