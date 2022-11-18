<script>
  import { baseUrl } from '$/api';
  import { filetypeToReadable, bytesToReadable } from '$/utils';
  import Icon from '$c/Icon.svelte';

  export let id = null;
  export let title = null;
  export let type = null;
  export let filesize = null;
  export let uploaded_on = null;
  export let modified_on = null;

  export let marked = false;

  $: isImg = type?.startsWith('image/');
  $: loading = true;
  $: imgError = false;
</script>

<div class="wrapper" class:marked on:click>
  <div class="thumbnail" class:boilerplate={!isImg || loading || imgError}>
    {#if isImg}
      {#if imgError}
        <Icon name="img" dark />
      {:else}
        <img
          src="{baseUrl}/assets/{id}#{modified_on ? modified_on : uploaded_on}?key=thumbnail"
          alt=""
          on:error={() => (imgError = true)}
          on:load={() => (loading = false)}
        />
        {#if loading}
          <Icon name="img" dark />
        {/if}
      {/if}
    {:else if id}
      <Icon name="file" dark />
    {:else}
      <Icon name="edit" dark />
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
    transition: padding 100ms, border 100ms;
  }
  .wrapper:hover {
    padding: 0.5rem;
    background-color: rgba(0, 0, 0, 0.2);
  }
  .wrapper.marked {
    padding: 0.5rem;
    border: solid 2px var(--primary);
  }

  .thumbnail {
    overflow: hidden;
    aspect-ratio: 1 / 1;
    display: grid;
    place-items: center;
    border-radius: var(--border-radius);
    background-color: var(--accent-white);
  }
  .thumbnail.boilerplate {
    padding: 30%;
  }
  .thumbnail img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
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
