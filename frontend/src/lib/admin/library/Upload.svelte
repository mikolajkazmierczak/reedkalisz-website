<script>
  import { createEventDispatcher } from 'svelte';
  import api from '$lib/api';

  const dispatch = createEventDispatcher();

  export let update = null; // id of file to update

  export let open = true;
  let highlighted = false;

  let input;

  async function handleInput() {
    open = false;
    const files = input.files;
    if (files.length) {
      const form = new FormData();
      for (const file of files) {
        form.append('file', file);
      }
      if (update) {
        await api.files.updateOne(update, form);
      } else {
        await api.files.createMany(form);
      }
      dispatch('uploaded');
    }
    open = true;
    highlighted = false;
  }
</script>

<div class="wrapper" class:highlighted>
  <div class="text">
    {#if open}
      <img src="/icons/dark/upload.svg" alt="" />
      <span>Przeciągnij lub <span style:text-decoration="underline">Wybierz</span></span>
    {:else}
      <span>Przetwarzanie...</span>
    {/if}
  </div>
  <input
    disabled={!open}
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
    align-items: center;
    font-size: 1.5rem;
    padding: 0.5rem;
  }
  img {
    margin-right: 0.5rem;
  }
  input {
    cursor: pointer;
    opacity: 0;
    width: 100%;
    height: 100%;
  }
</style>
