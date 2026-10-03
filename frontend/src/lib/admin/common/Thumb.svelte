<script>
  import { onMount } from 'svelte';
  import { baseUrl } from '$/api';
  import { portal } from '@/portal';
  import Icon from '$c/Icon.svelte';
  import Lightbox from '@c/Lightbox.svelte';

  // A product's picture, small and squircled (the "mini" preset: 64 x 64, cut to a square); without one, the
  // products' icon on grey. As big as `size`.
  // `zoom`: as the website's gallery - under the pointer, enlarged (5.6rem: the website's 8rem, 30% smaller), the
  // whole picture (not cut to a square: the "thumb" preset, on white, padded) in a dark edge, over everything (not
  // inside the table, which would cut it); a click shows the original over the page (a button: a table's row doesn't
  // open for it).
  export let file = null; // its id
  export let src = null; // or a picture from elsewhere (a supplier's, not imported): shown as it is, every size
  $: url = (key) => (file ? `${baseUrl}/assets/${file}${key ? `?key=${key}` : ''}` : src);
  export let size = '1.75rem';
  export let zoom = false;
  export let blank = false; // without a picture just its room (a list's names stay in line), not the icon

  let failed = false;
  $: (file, src, (failed = false));
  $: shown = !!(file || src) && !failed;
  $: zoomable = zoom && shown;

  // the enlarged one, centred on the thumbnail, kept inside the window: { left, top } while hovered
  const PREVIEW = 5.6; // rem: the website's picker thumbnail enlarged (8rem), 30% smaller
  const EDGE = 8; // px from the window's edges
  let thumb;
  let preview = null;
  // the window listened to only while it's enlarged (a list has a hundred of them): a scroll moves the thumbnail away
  // from its preview
  const onScroll = () => leave();
  onMount(() => () => removeEventListener('scroll', onScroll, true));

  function enter() {
    if (!zoomable || !matchMedia('(hover: hover)').matches) return;
    addEventListener('scroll', onScroll, true);
    const r = thumb.getBoundingClientRect();
    const side = PREVIEW * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const clamp = (v, max) => Math.min(Math.max(EDGE, v), max - side - EDGE);
    preview = {
      left: clamp(r.left + r.width / 2 - side / 2, innerWidth),
      top: clamp(r.top + r.height / 2 - side / 2, innerHeight),
    };
  }
  function leave() {
    preview = null;
    removeEventListener('scroll', onScroll, true);
  }

  let open = false;
  function show(e) {
    e.stopPropagation();
    leave();
    open = true;
  }
</script>

<svelte:element
  this={zoomable ? 'button' : 'span'}
  type={zoomable ? 'button' : undefined}
  role={zoomable ? 'button' : 'presentation'}
  class="thumb"
  class:zoom={zoomable}
  class:blank={blank && !shown}
  aria-label={zoomable ? 'Powiększ zdjęcie' : undefined}
  style:--size={size}
  bind:this={thumb}
  on:mouseenter={enter}
  on:mouseleave={leave}
  on:click={zoomable ? show : null}>
  {#if shown}
    <img src={url('mini')} alt="" loading="lazy" on:error={() => (failed = true)} />
  {:else if !blank}
    <span class="none"><Icon fill name="products" color="var(--grey-500)" /></span>
  {/if}
</svelte:element>

{#if preview}
  <!-- the pointer goes through it, to the thumbnail under it -->
  <div class="preview" use:portal style:left="{preview.left}px" style:top="{preview.top}px" style:--side="{PREVIEW}rem">
    <img src={url('thumb')} alt="" />
  </div>
{/if}

{#if open}
  <Lightbox src={url(null)} on:close={() => (open = false)} />
{/if}

<style>
  .thumb {
    flex: none;
    position: relative;
    overflow: hidden;
    display: inline-flex;
    vertical-align: middle;
    width: var(--size);
    height: var(--size);
    margin: 0;
    padding: 0;
    border: none;
    border-radius: calc(var(--size) * 0.3);
    corner-shape: squircle;
    background-color: var(--light);
  }
  /* nothing there, only its room */
  .thumb.blank {
    background-color: transparent;
  }
  .thumb.blank::after {
    content: none;
  }
  /* its edge over the picture: a white product on a white row still has one */
  .thumb::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    corner-shape: squircle;
    box-shadow: inset 0 0 0 1px var(--black-10);
  }
  .zoom {
    cursor: zoom-in;
  }
  .zoom:focus-visible {
    outline: solid 2px var(--navy-700);
    outline-offset: 1px;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  /* as the website's picker enlarged (its border and padding, 30% smaller): over everything but the tooltips, a
     dark edge, a soft shadow; squircled as the admin's thumbnails */
  .preview {
    z-index: 1700;
    pointer-events: none;
    position: fixed;
    overflow: hidden;
    display: flex;
    width: var(--side);
    height: var(--side);
    border: solid 1px var(--text);
    border-radius: var(--border-radius);
    corner-shape: squircle;
    background-color: var(--light);
    box-shadow: 0 0.25rem 1rem rgb(17 17 16 / 0.18);
  }
  /* the whole picture, padded */
  .preview img {
    padding: 0.35rem;
    object-fit: contain;
  }
  /* the icon at half the size, in the middle */
  .none {
    display: flex;
    width: 100%;
    height: 100%;
    padding: 25%;
    background-color: var(--grey-100);
  }
</style>
