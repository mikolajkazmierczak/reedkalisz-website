<script>
  import { baseUrl } from '$lib/api';
  import { filetypeToReadable, bytesToReadable } from '$lib/utils';

  export let id;
  export let title;
  export let type;
  export let filesize;

  export let marked = false;

  $: isImg = type?.startsWith('image/');
  $: loading = true;
  $: imgError = false;
</script>

<div class="wrapper" class:marked on:click>
  <div class="icon" class:boilerplate={!isImg || loading || imgError}>
    {#if isImg}
      {#if imgError}
        <img src={`/icons/dark/img.svg`} alt="" />
      {:else}
        <img
          src={`${baseUrl}/assets/${id}?key=thumbnail`}
          alt=""
          on:error={() => (imgError = true)}
          on:load={() => (loading = false)}
        />
        {#if loading}
          <img src={`/icons/dark/img.svg`} alt="" />
        {/if}
      {/if}
    {:else if id}
      <img src={`/icons/dark/file.svg`} alt="" />
    {:else}
      <img src={`/icons/dark/edit.svg`} alt="" />
    {/if}
  </div>
  <div class="text">
    <b class="title" title={title ?? 'Wybierz'}>{title ?? 'Wybierz'}</b>
    <span class="type">{type ? filetypeToReadable(type) : '-'}</span>
    <span class="filesize">{filesize ? bytesToReadable(filesize) : '-'}</span>
  </div>
</div>

<style>
  .wrapper {
    user-select: none;
    cursor: pointer;
    --border-radius: 0.5rem;
    border-radius: var(--border-radius);
    transition: padding 100ms;
  }
  .wrapper:hover {
    padding: 0.5rem;
    background-color: var(--accent);
  }
  .wrapper.marked {
    padding: 0.5rem;
    background-color: var(--accent-dark);
  }

  .icon {
    overflow: hidden;
    aspect-ratio: 1 / 1;
    display: grid;
    place-items: center;
    border-radius: var(--border-radius);
    background-color: var(--accent-white);
  }
  .icon img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .icon.boilerplate img {
    width: auto;
    height: auto;
  }

  .text {
    margin: 0.25rem;
    margin-top: 0.5rem;
  }
  .title {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  span {
    opacity: 0.8;
    font-size: 0.8rem;
  }
</style>
