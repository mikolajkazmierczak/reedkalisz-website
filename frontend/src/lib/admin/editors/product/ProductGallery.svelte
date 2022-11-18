<script>
  import { moveItem } from '$/utils';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Picker from '@c/library/Picker.svelte';

  export let gallery;

  function pushImg() {
    gallery.push({
      img: null,
      enabled: true,
      main: false
    });
    gallery = gallery;
  }
  function removeImg(i) {
    gallery.splice(i, 1);
    gallery = gallery;
  }
  function moveImg(i, d) {
    gallery = moveItem(gallery, i, d);
  }

  function setMain() {
    gallery.forEach(g => (g.main = false));
    gallery[0].main = true;
    gallery[0].enabled = true;
    gallery = gallery;
  }

  $: if (gallery.length) setMain();
</script>

<section class="ui-section">
  <h2 class="ui-h2">Galeria</h2>
  <div class="imgs ui-section__row">
    {#each gallery as img, i (img)}
      <div class="ui-box ui-box--element" class:ui-box--uneditable={!img.enabled} class:main={i == 0}>
        <div class="actions">
          <div>
            {#if !i == 0} <Button icon="arrow_left" on:click={() => moveImg(i, -1)} square /> {/if}
            {#if i < gallery.length - 1} <Button icon="arrow_right" on:click={() => moveImg(i, 1)} square /> {/if}
          </div>
          <Button icon="delete" on:click={() => removeImg(i)} dangerous />
        </div>
        <Picker bind:selected={img.img} />
        {#if !img.main}
          <Input type="checkbox" bind:value={img.enabled}>Włączone</Input>
        {/if}
      </div>
    {/each}
    <Button icon="add" on:click={pushImg}>Dodaj</Button>
  </div>
</section>

<style>
  .imgs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
    gap: 1rem;
  }

  .main {
    outline: var(--outline-dashed);
  }
  .actions {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .actions div {
    display: flex;
    gap: 0.5rem;
  }
</style>
