<script>
  import { fly } from 'svelte/transition';
  import { baseUrl } from '$/api';

  export let imgs;
  let index = imgs.length ? 0 : null;

  export let small = false;
  $: single = imgs.length === 1;
</script>

<div class="gallery">
  {#if imgs.length}
    <div class="main" class:single>
      {#key index}
        <img src="{baseUrl}/assets/{imgs[index].img}" alt="" in:fly={{ y: 20, duration: 200 }} />
      {/key}
    </div>
    {#if !single}
      <div class="picker" class:small>
        {#each imgs as { enabled, img }, i}
          <div class="picker-img" class:admin={!enabled} on:mouseenter={() => (index = i)}>
            <img src="{baseUrl}/assets/{img}" alt="" />
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .gallery {
    --border: 1px solid rgba(0, 0, 0, 0.1);
    width: 100%;
    background-color: #fff;
  }

  .main {
    border-radius: 10px 10px 0 0;
    border: var(--border);
    padding: 5%;
    width: 100%;
    aspect-ratio: 1 / 1;
  }
  .main.single {
    border-radius: 10px;
  }
  .picker {
    overflow: hidden;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    border-radius: 0 0 10px 10px;
    border: var(--border);
    border-top: none;
    background-color: rgb(250, 250, 250);
  }
  .picker.small {
    grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));
  }
  .picker-img {
    cursor: pointer;
    outline: var(--border);
    padding: 5%;
    background-color: #fff;
  }
  .picker-img.admin {
    opacity: 0.5;
  }

  img {
    display: block;
    width: 100%;
    object-fit: contain;
    aspect-ratio: 1 / 1;
  }
</style>
