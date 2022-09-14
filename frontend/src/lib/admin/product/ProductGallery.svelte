<script>
  import { baseUrl } from '$lib/api';
  import Input from '$lib/admin/input/Input.svelte';
  import Button from '$lib/admin/input/Button.svelte';
  import Picker from '$lib/admin/library/Picker.svelte';

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
        <Button icon="delete.svg" on:click={() => removeImg(i)} dangerous>Usuń</Button>
        <Picker bind:id={img.img} />
        {#if !img.main}
          <Input type="checkbox" bind:value={img.enabled}>Włączone</Input>
        {/if}
      </div>
    {/each}
    <Button icon="add.svg" on:click={pushImg}>Dodaj</Button>
  </div>
</section>

<style>
  .imgs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
    gap: 1rem;
  }

  .main {
    outline: 2px dashed var(--primary);
  }
</style>
