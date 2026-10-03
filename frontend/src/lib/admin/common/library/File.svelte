<script context="module">
  // what a File shows, out of a directus_files row
  export const fileProps = ({
    id,
    title,
    type,
    filesize,
    width,
    height,
    filename_download,
    uploaded_on,
    modified_on,
    company,
  }) => ({
    id,
    title,
    type,
    filesize,
    width,
    height,
    filename_download,
    uploaded_on,
    modified_on,
    company,
  });
</script>

<script>
  import { tick } from 'svelte';
  import { baseUrl } from '$/api';
  import { companies } from '@/globals';
  import CompanyIcon from '@c/CompanyIcon.svelte';
  import { filetypeToReadable, bytesToReadable } from '%/utils';
  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';

  export let id = null;
  export let title = null;
  export let type = null;
  export let filesize = null;
  export let width = null;
  export let height = null;
  export let filename_download = null;
  export let uploaded_on = null;
  export let modified_on = null;
  export let company = null;

  export let src = null; // an image not in the library yet (the api's): shown as it will be once imported
  export let note = null; // one more line of the tooltip

  export let marked = false;
  export let backing = null; // on the dots (the library, a picker on a page): its text on their grey, so it reads
  export let remove = null; // marked to go: red, and this ("Usuń") in a pill on the top edge
  export let flag = null; // this ("NOWE") in a purple pill there (then the red one just its bin), and a purple ring
  export let clickable = true; // not: only looked at (a disabled button: no pointer, no focus, no hover)
  // slot "tag": what the image is for, in a pill on the bottom edge of the image

  // what an image from elsewhere is, as far as it shows: its type by its name, its size once loaded
  $: srcType =
    src &&
    (src
      .match(/\.(jpe?g|png|webp|gif|svg)(?:[?#]|$)/i)?.[1]
      .toLowerCase()
      .replace('jpg', 'jpeg') ??
      null);
  $: kind = type ?? (srcType && `image/${srcType === 'svg' ? 'svg+xml' : srcType}`);
  let natural = null;
  $: [w, h] = natural ?? [width, height];

  $: isImg = !!src || type?.startsWith('image/');
  $: companyName = company && $companies?.find((c) => c.id === company)?.name;
  $: meta = [
    kind ? filetypeToReadable(kind) : '-',
    filesize ? bytesToReadable(filesize) : src ? null : '-',
    w && `${w}x${h}`,
  ]
    .filter(Boolean)
    .join(' ');
  let loading = true;
  let imgError = false;
  let img;
  // afresh for every file (the picker shows one File for whichever is picked) - one the browser has already (the same
  // picture again) is loaded at once: no load event comes for it
  $: (id, src, reset());
  async function reset() {
    loading = true;
    imgError = false;
    natural = null;
    await tick();
    if (img?.complete && img.naturalWidth) loading = false;
  }
  function loaded(e) {
    loading = false;
    if (src) natural = [e.target.naturalWidth, e.target.naturalHeight];
  }
</script>

<div
  class="wrapper"
  class:marked
  class:remove={marked && remove}
  class:flagged={flag && !(marked && remove)}
  class:backed={backing}
  class:tagged={$$slots.tag}
  style:--backing={backing}
  class:still={!clickable}
  role="button"
  tabindex={clickable ? 0 : -1}
  aria-disabled={!clickable}
  on:click
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.currentTarget.click();
    }
  }}>
  <div class="thumbnail">
    <!-- an image on its way: a shimmering skeleton, the picture fading in over it once it's here -->
    <div class="face" class:boilerplate={!isImg || imgError} class:skeleton={isImg && !imgError && loading}>
      {#if isImg}
        {#if imgError}
          <Icon fill name="img" dark />
        {:else}
          <img
            src={src ?? `${baseUrl}/assets/${id}?key=thumb#${modified_on ? modified_on : uploaded_on}`}
            alt=""
            loading="lazy"
            class:shown={!loading}
            bind:this={img}
            on:error={() => (imgError = true)}
            on:load={loaded} />
        {/if}
      {:else if id}
        <Icon fill name="file" dark />
      {:else}
        <Icon fill name="edit" dark />
      {/if}
    </div>
    {#if $$slots.tag}<div class="edge"><span class="tag"><slot name="tag" /></span></div>{/if}
  </div>
  {#if id || src}
    <Tooltip>
      <small>
        <b>{title ?? filename_download ?? id}</b><br />{#if companyName}<CompanyIcon company={companyName} />
          {companyName} ·
        {/if}{meta}
        {#if filename_download && filename_download !== title}<br />{filename_download}{/if}
        {#if note}<br />{note}{/if}
      </small>
    </Tooltip>
  {/if}
  {#if flag || (marked && remove)}
    <div class="pills">
      {#if flag}<span class="pill flag">{flag}</span>{/if}
      {#if marked && remove}
        <span class="pill" class:bare={flag}>
          <Icon name="delete" light height="0.8rem" />{#if !flag}{remove}{/if}
        </span>
      {/if}
    </div>
  {/if}
  <div class="text">
    <span class="title">{title ?? 'Wybierz'}</span>
    <span class="meta">{meta}</span>
  </div>
</div>

<style>
  /* hovered or marked, the face draws in and the text rises by transforms only: resizing under the pointer made the
     hover flicker */
  .wrapper {
    --inset: 0rem;
    --shrink: 1;
    position: relative;
    user-select: none;
    cursor: pointer;
    border-radius: var(--box-radius);
    corner-shape: squircle;
    /* marked: a ring inside it, not a border (one appearing can't fade in, and it would move what's in it) */
    box-shadow: inset 0 0 0 0 var(--navy-700);
    /* the shade at once, not faded: two tiles fading at once (jumping from one to the next) flashed */
    transition: box-shadow 100ms;
  }
  .wrapper.still {
    cursor: default;
  }
  .wrapper:not(.still):hover,
  .wrapper.marked {
    --inset: 0.4rem; /* as far in as the text (see .text) */
    --shrink: 0.92; /* the face that much in (on a ~8.5rem tile: the inset) */
  }
  /* hovered: a faint shade over whatever it's on (the dots, a variant's blue), its text's backing (on the dots) the
     colour that shade makes over it */
  .wrapper:not(.still):hover {
    background-color: rgb(0 0 0 / 0.1);
  }
  .wrapper.backed:not(.still):hover {
    --face: color-mix(in srgb, var(--backing) 90%, black);
  }
  /* only the tile takes the pointer: its hover is its own box's, whatever moves in it (and the image isn't dragged off) */
  .wrapper :global(*) {
    pointer-events: none;
  }
  .wrapper.marked {
    box-shadow: inset 0 0 0 2px var(--navy-700);
  }
  /* focused from the keyboard: a ring inside it as the marked one's, lighter - not the browser's (it ignores the
     squircle); from the pointer none */
  .wrapper:focus {
    outline: none;
  }
  /* flagged: round it, outside (inside, the picture would cover it) */
  .wrapper.flagged {
    outline: solid 2px var(--purple-300);
    outline-offset: 1px;
  }
  .wrapper:focus-visible:not(.marked) {
    box-shadow: inset 0 0 0 2px var(--navy-500);
  }
  .wrapper.remove {
    box-shadow: inset 0 0 0 2px var(--red-500);
  }
  /* on the middle of the top edge, together */
  .pills {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    gap: 0.25rem;
  }
  .pill {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.1rem 0.45rem 0.1rem 0.35rem;
    border: 1px solid var(--red-500); /* (as tall as the flag) */
    border-radius: 1rem;
    background-color: var(--red-500);
    color: var(--light);
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
  }
  .pill.bare {
    padding-inline: 0.3rem;
  }
  /* as the API's mark of something new (Button's tone 'new') */
  .pill.flag {
    padding: 0.1rem 0.45rem;
    border: 1px solid var(--purple-300);
    background-color: var(--purple-100);
    color: var(--navy-700);
    letter-spacing: 0.02em;
  }

  /* on the middle of the image's bottom edge, nearly white (it reads over a photo, whatever its colour): drawn in with
     the face, over the text's backing. Not frosted: dozens of blurs over the faces' layers (a product's 50 photos in the
     review) left Chrome painting only the pills, the photos and names blank */
  .edge {
    position: absolute;
    inset: 0;
    z-index: 1;
    transform: scale(var(--shrink));
    transition: transform 100ms;
  }
  .tag {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 50%);
    display: flex;
    align-items: center;
    gap: 0.25rem;
    max-width: calc(100% - 0.5rem);
    padding: 0.1rem 0.45rem;
    border: 1px solid rgb(0 0 0 / 0.08);
    border-radius: 1rem;
    background-color: rgb(255 255 255 / 0.92);
    box-shadow: 0 0.0625rem 0.25rem rgb(0 0 0 / 0.08);
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
  }
  .tagged .text {
    padding-top: 0.85rem; /* below the tag */
  }

  .thumbnail {
    position: relative;
    display: grid;
    aspect-ratio: 1 / 1;
  }
  .face {
    overflow: hidden;
    display: grid;
    place-items: center;
    border-radius: var(--box-radius);
    corner-shape: squircle;
    background-color: var(--grey-100);
    transform: scale(var(--shrink));
    transition: transform 100ms;
    will-change: transform; /* its own layer all along: made and dropped with each hover, the tile under it flashed */
  }
  .face.boilerplate {
    padding: 30%;
  }
  .face img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 200ms;
  }
  .face img.shown {
    opacity: 1;
  }
  /* a light sweeping across a shade darker than what it's on (the picker's grey, a variant's blue) */
  .face.skeleton {
    background-color: rgb(0 0 0 / 0.06);
    background-image: linear-gradient(100deg, transparent 30%, rgb(255 255 255 / 0.55) 50%, transparent 70%);
    background-size: 200% 100%;
    animation: shimmer 1.2s linear infinite;
  }
  @keyframes shimmer {
    from {
      background-position: 150% 0;
    }
    to {
      background-position: -50% 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .face.skeleton {
      animation: none;
    }
    .face img {
      transition: none;
    }
  }

  /* up after the thumbnail's face (by a transform: see above) */
  .text {
    padding: 0.45rem 0.4rem 0.2rem;
    line-height: 1.15;
    transform: translateY(calc(-1 * var(--inset)));
    transition: transform 100ms;
    will-change: transform; /* (see .face) */
  }
  /* a `backing` pill behind each line so it reads over the dots (a backdrop blur was too slow); the margin gives back
     the padding */
  .title,
  .meta {
    display: block;
    width: fit-content;
    max-width: calc(100% + 0.5rem);
    margin: -0.05rem -0.25rem;
    padding: 0.05rem 0.25rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-radius: 0.35rem;
    corner-shape: squircle;
    background-color: var(--face, var(--backing, transparent));
  }
  .title {
    font-size: 0.85rem;
    font-weight: 600;
  }
  .meta {
    opacity: 0.8;
    font-size: 0.75rem;
  }
</style>
