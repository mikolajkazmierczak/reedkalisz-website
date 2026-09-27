<script>
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  import heimdall from '$/heimdall';
  import { unsaved } from '@/stores';
  import { editedElsewhere } from '@/dialog';
  import Icon from '$c/Icon.svelte';
  import BarButton, { barIconStroke } from '@c/BarButton.svelte';

  import editing from './editing';

  function spin(node, { duration }) {
    return {
      duration,
      css: (t) => {
        const eased = cubicOut(t);
        return `transform: rotate(${eased * 360}deg);`;
      },
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
  export let save = async (action) => await action();
  export let cancel = async (action) => await action();
  export let remove = async (action) => await action();
  export let removable = false; // shows the delete button in the bar (pass it once the item exists)

  function checkCollection() {
    if (collection == null) throw new Error('Collection name was not provided to the Editor instance');
  }

  function handleExit() {
    // nagivate back
    goto(root, { noScroll: true });
  }

  let saving = false;
  async function handleSave() {
    if (saving) return; // a second click would create a new item twice
    saving = true;
    try {
      await save(async () => {
        [item, itemOriginal] = await editing.save(collection, item, itemOriginal, { root });
      });
    } finally {
      saving = false;
    }
  }

  async function handleCancel() {
    await cancel(async () => {
      [item, itemOriginal] = await editing.cancel(item, itemOriginal, { root });
    });
  }

  // (checked only for the default delete: the library's file editor deletes on its own)
  async function handleRemove() {
    await remove(async () => {
      checkCollection();
      return await editing.remove(collection, item.id, { root });
    });
  }

  $: if ($unsaved) checkCollection();

  heimdall.listen(({ match, me }) => {
    if (collection && item?.id != null && item.id !== '+' && match(collection, item.id) && !me) editedElsewhere();
  });
</script>

<svelte:head>
  <title>Admin | {title} | REED Kalisz</title>
</svelte:head>

<div class="wrapper" in:fade={{ duration: 200 }} out:fade={{ duration: 100 }}>
  <div class="outside" role="presentation" on:click|self={handleExit} />
  <div class="container" in:fly={{ x: 100, duration: 400 }} out:fly={{ x: 50, duration: 100 }}>
    <div class="bar ui-topbar">
      <div class="actions">
        {#if $unsaved}
          <BarButton square hoverColor="var(--red-300)" title="Anuluj" on:click={handleCancel}>
            <span slot="icon" class="icon" in:spin><Icon fill name="close" dark strokeWidth={barIconStroke} /></span>
          </BarButton>
        {:else}
          <BarButton square title="Wróć" on:click={handleExit}>
            <span slot="icon" class="icon" in:spin
              ><Icon fill name="arrow_left" dark strokeWidth={barIconStroke} /></span>
          </BarButton>
        {/if}

        <div class="save-wrapper" class:visible={$unsaved}>
          {#if $unsaved}
            <BarButton icon={saving ? null : 'ok'} hoverColor="var(--green-200)" on:click={handleSave}>
              {#if saving}Zapisuję...{:else}Zapisz{/if}
            </BarButton>
          {/if}
        </div>
      </div>

      <div class="title">
        <div class="icon">
          <Icon fill name={icon} />
        </div>
        <h2>{title ?? 'Wczytywanie...'}</h2>
      </div>

      <div class="end">
        <slot name="bar" />
        {#if removable}
          <BarButton dangerous icon="delete" on:click={handleRemove}>Usuń</BarButton>
        {/if}
      </div>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</div>

<style>
  .wrapper {
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--black-20);
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
    background-color: var(--grey-100);
    background-image: url('/imgs/dot_grid.png');
    background-size: 10rem;
  }

  .bar {
    z-index: 1;
    position: sticky;
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: min-content 1fr auto;
    align-items: center; /* centers actions, for some reason */
    gap: 1rem;
    padding: 0 1.5rem;
    height: 4rem;
    border-bottom: var(--border-light);
  }

  .actions {
    overflow: hidden;
    display: flex;
    align-items: center;
    height: 2rem;
  }
  .save-wrapper {
    width: 0;
    height: 100%;
    transition: width 200ms;
  }
  .save-wrapper.visible {
    width: 7.75rem;
  }
  .save-wrapper :global(.bar-button) {
    margin-left: 1rem;
  }

  /* what else can be done with the item, then deleting it */
  .end {
    display: flex;
    gap: 0.5rem;
  }

  .title {
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    height: 100%;
  }
  .title .icon {
    background-color: var(--black-6); /* a grey that shows on the see-through bar */
    border-radius: 50%;
    padding: 0.4rem;
    height: 60%;
    aspect-ratio: 1 / 1;
  }
  .title h2 {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 700;
  }

  /* its own stacking context under the bar: what rises inside it (the API pills) stays under the bar */
  .content {
    position: relative;
    z-index: 0;
    padding: 1rem 1.5rem 1.5rem; /* like a page (see the admin layout) */
  }

  /* a phone: full width (the phone's back closes it); the bar one line, scrolled sideways to its buttons, the title
     cut short so they're in reach */
  @media (max-width: 50rem) {
    .container {
      width: 100%;
    }
    .bar {
      display: flex;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      gap: 0.75rem;
      padding: 0 0.75rem;
      height: 3.25rem;
    }
    .bar > * {
      flex: none;
    }
    .title {
      gap: 0.5rem;
      max-width: 65vw;
    }
    .title .icon {
      padding: 0.35rem;
      height: 2rem;
    }
    .title h2 {
      font-size: 1.2rem;
    }
    .content {
      padding: 0.75rem 0.75rem 1.5rem;
    }
  }
</style>
