<script>
  import heimdall from '$/heimdall';
  import { createEventDispatcher } from 'svelte';
  import api from '$/api';
  import Icon from '$c/Icon.svelte';

  const dispatch = createEventDispatcher();

  export let update = null; // id of file to update

  let uploading = true;
  let highlighted = false;

  let input;

  async function handleInput() {
    uploading = false;
    const files = input.files;
    if (files.length) {
      const form = new FormData();
      for (const file of files) {
        form.append('file', file);
      }
      if (update) {
        const fileData = await api.files.updateOne(update, form);
        heimdall.emit('directus_files', fileData.id);
      } else {
        const filesData = (await api.files.createMany(form)).data;
        const filesArray = Array.isArray(filesData) ? filesData : [filesData];
        const filesIds = filesArray.map(f => f.id);
        heimdall.emit('directus_files', filesIds);
      }
      dispatch('upload');
    }
    uploading = true;
    highlighted = false;
  }
</script>

<div class="wrapper" class:highlighted>
  <div class="text">
    {#if uploading}
      <Icon height="3rem" name="upload" dark />
      <span>Przeciągnij<br />lub <span style:text-decoration="underline">Wybierz</span></span>
    {:else}
      <span>Przetwarzanie...</span>
    {/if}
  </div>

  <input
    disabled={!uploading}
    multiple={!update}
    type="file"
    on:input={handleInput}
    on:dragenter={() => (highlighted = true)}
    on:dragleave={() => (highlighted = false)}
    bind:this={input}
  />
</div>

<style>
  .wrapper {
    position: relative;
    border-radius: 0.5rem;
    border: dashed 2px var(--primary-dark);
    width: 100%;
    height: 125px;
  }
  .wrapper.highlighted {
    background-color: var(--accent-light);
  }

  .text {
    pointer-events: none;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;

    padding: 0.5rem;
    width: 100%;
    height: 100%;

    font-size: 1.5rem;
  }

  input {
    cursor: pointer;
    opacity: 0;
    width: 100%;
    height: 100%;
  }
</style>
