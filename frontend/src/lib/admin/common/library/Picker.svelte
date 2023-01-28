<script>
  import { fly, fade } from 'svelte/transition';

  import api from '$/api';
  import { read as fields } from '%/fields/directus_files';

  import File from '@c/library/File.svelte';
  import Icon from '$c/Icon.svelte';
  import HoverCircle from '$c/HoverCircle.svelte';
  import Library from '@c/library/Library.svelte';

  let opened;

  export let selected;
  let file;
  let fileData;

  function close() {
    opened = false;
  }

  function handleSelect(e) {
    file = e.detail;
    selected = file.id;
    close();
  }

  async function read(id) {
    const getData = ({ id, title, type, filesize, uploaded_on, modified_on }) => {
      return { id, title, type, filesize, uploaded_on, modified_on };
    };

    if (id) file = await api.files.readOne(id, { fields });
    else file = null;
    fileData = file ? getData(file) : null;
  }

  $: read(selected);
</script>

<File {...file} marked={false} on:click={() => (opened = true)} />

{#if opened}
  <div class="bg" transition:fade={{ duration: 200 }} />
  <div class="wrapper" on:click|self={close}>
    <div class="library" transition:fly={{ y: -50, duration: 200 }}>
      <Library picker bind:selected on:select={handleSelect}>
        <div slot="picker" class="buttons">
          <button on:click={close}>
            <HoverCircle />
            <div class="icon"><Icon name="arrow_left" light /></div>
            <span>Powrót</span>
          </button>
          {#if selected}
            <button class="deselect" on:click={() => (selected = null)}>
              <HoverCircle />
              <div class="icon"><Icon name="close" light /></div>
              <span>Wyczyść</span>
            </button>
          {/if}
        </div>
      </Library>
    </div>
  </div>
{/if}

<style>
  .bg,
  .wrapper {
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    padding: 1rem;
    width: 100%;
    height: 100%;
  }
  .bg {
    background-color: rgba(0, 0, 0, 0.5);
  }
  .wrapper {
    overflow-y: auto;
    border-radius: 1rem;
  }
  .library {
    border-radius: 1rem;
    padding: 1rem;
    width: 100%;
    background-color: var(--accent-white);
    background-image: url('/imgs/dot_grid.png');
    background-size: 160px;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1px 0;
  }
  button {
    cursor: pointer;
    overflow: hidden;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--border-radius);
    border: none;
    height: 100%;
    font-size: 1rem;
    background-color: var(--primary);
  }
  button.deselect {
    background-color: var(--primary-dark);
  }
  button:disabled {
    cursor: not-allowed;
    background-color: var(--accent-white);
    border: var(--border-light);
  }
  button .icon {
    position: relative;
    top: 0.1rem;
    width: 1.5rem;
    margin-right: 0.5rem;
  }
  button span {
    position: relative;
    z-index: 1;
    color: var(--light);
  }
</style>
