<script>
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  import { unsaved } from '@/stores';
  import Icon from '$c/Icon.svelte';
  import HoverCircle from '$c/HoverCircle.svelte';

  import editing from './editing';

  function spin(node, { duration }) {
    return {
      duration,
      css: t => {
        const eased = cubicOut(t);
        return `transform: rotate(${eased * 360}deg);`;
      }
    };
  }

  export let root;
  export let icon;
  export let title;

  if (root === undefined) throw new Error('Root pathname was not provided to the Editor instance');

  export let collection = null;
  export let item = null;
  export let itemOriginal = null;

  // can be provided by parent
  export let save = async action => await action();
  export let cancel = async action => await action();
  export let remove = async action => await action();

  function checkCollection() {
    if (collection == null) throw new Error('Collection name was not provided to the Editor instance');
  }

  function handleExit() {
    // nagivate back
    goto(root, { noScroll: true });
  }

  let saving = false;
  async function handleSave() {
    saving = true;
    await save(async ({ fieldsToIgnore = [] } = {}) => {
      [item, itemOriginal] = await editing.save(collection, item, itemOriginal, { root, fieldsToIgnore });
    });
    saving = false;
  }

  async function handleCancel() {
    await cancel(async ({ prompt = null } = {}) => {
      [item, itemOriginal] = await editing.cancel(item, itemOriginal, { root, prompt });
    });
  }

  async function handleRemove() {
    checkCollection();
    await remove(async ({ prompt = null } = {}) => {
      await editing.remove(collection, item.id, { root, prompt });
    });
  }

  $: if ($unsaved) checkCollection();
</script>

<svelte:head>
  <title>Admin | {title} | REED Kalisz</title>
</svelte:head>

<div class="wrapper" in:fade={{ duration: 200 }} out:fade={{ duration: 100 }}>
  <div class="outside" on:click|self={handleExit} />
  <div class="container" in:fly={{ x: 100, duration: 400 }} out:fly={{ x: 50, duration: 100 }}>
    <div class="bar">
      <div class="actions">
        {#if $unsaved}
          <div class="button back" role="button" on:click={handleCancel}>
            <HoverCircle color={'var(--main-3)'} />
            <div class="icon" in:spin>
              <Icon fill name="close" dark />
            </div>
          </div>
        {:else}
          <div class="button back" role="button" on:click={handleExit}>
            <HoverCircle color={'var(--accent-light)'} />
            <div class="icon" in:spin>
              <Icon fill name="arrow_left" dark />
            </div>
          </div>
        {/if}

        <div class="save-wrapper" class:visible={$unsaved}>
          {#if $unsaved}
            <div class="button save" role="button" on:click={handleSave}>
              <HoverCircle color={'var(--success)'} />
              {#if !saving}
                <div class="icon"><Icon fill name="ok" dark /></div>
              {/if}
              <span>
                {#if saving}Zapisuję...{:else}Zapisz{/if}
              </span>
            </div>
          {/if}
        </div>
      </div>

      <div class="title">
        <div class="icon">
          <Icon fill name={icon} />
        </div>
        <h2>{title ?? 'Wczytywanie...'}</h2>
      </div>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</div>

<style>
  .button {
    cursor: pointer;
    overflow: hidden;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    border: solid 2px var(--accent-text);
    padding: 0 1rem;
    height: 100%;
  }
  .button .icon,
  .button span {
    z-index: 1;
    position: relative;
  }
  .button .icon {
    height: 65%;
  }

  .wrapper {
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
  }

  .outside {
    z-index: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .container {
    z-index: 1;
    position: absolute;
    top: 0;
    right: 0;
    overflow: auto;
    width: 80vw;
    height: 100%;
    background-color: var(--accent-white);
    background-image: url('/imgs/dot_grid.png');
    background-size: 160px;
  }

  .bar {
    z-index: 1;
    position: sticky;
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: min-content 1fr;
    align-items: center; /* centers actions, for some reason */
    gap: 1rem;
    padding: 0 2rem;
    height: 4rem;
    background-color: var(--accent);
  }

  .actions {
    overflow: hidden;
    display: flex;
    align-items: center;
    height: 2rem;
  }
  .back {
    padding: 0;
    aspect-ratio: 1.2 / 1;
  }
  .save-wrapper {
    width: 0;
    height: 100%;
    transition: width 200ms;
  }
  .save-wrapper.visible {
    width: 7.75rem;
  }
  .save {
    margin-left: 1rem;
  }

  .title {
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    height: 100%;
  }
  .title .icon {
    background-color: var(--primary-white);
    border-radius: 50%;
    padding: 0.4rem;
    height: 60%;
    aspect-ratio: 1 / 1;
  }
  .title h2 {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 900;
  }

  .content {
    z-index: 0;
    padding: 2rem;
  }
</style>
