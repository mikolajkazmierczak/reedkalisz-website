<script>
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  import heimdall from '$/heimdall';
  import { unsaved } from '@/stores';
  import { editedElsewhere } from '@/dialog';
  import Icon from '$c/Icon.svelte';
  import BarButton, { barIconStroke } from '@c/BarButton.svelte';
  import Mat from '@c/Mat.svelte';

  import editing from './editing';
  import { scrolled } from '@/scrolled';
  import { onGrid } from '@/onGrid';

  let container; // what scrolls (the bar over it turning from solid to frost with the scroll, see scrolled.js)

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
  export let serial = null; // the item's number after its title, in red, as a form's (a product's code)

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
  <div class="container" bind:this={container} in:fly={{ x: 100, duration: 400 }} out:fly={{ x: 50, duration: 100 }}>
    <div class="bar ui-topbar" use:scrolled={container}>
      <Mat bar />
      <div class="row">
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
          {#if serial}<span class="serial">{serial}</span>{/if}
        </div>

        <div class="end">
          <slot name="bar" />
          {#if removable}
            <BarButton dangerous icon="delete" on:click={handleRemove}>Usuń</BarButton>
          {/if}
        </div>
      </div>
    </div>
    <div class="content" use:onGrid>
      <Mat />
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
    width: round(down, 80vw, 1px); /* (whole pixels: its mat's lines crisp) */
    height: 100%;
    --bar: var(--header-height); /* the bar's height, the page header's */
    /* the sheet is whole half cells wide, what's left over past its mat's right frame (as the page's, see --leftover) */
    --leftover: var(--sheet-leftover);
    background-color: var(--board); /* a cutting mat of its own on it (Mat) */
    box-shadow: var(--shadow-lifted); /* a sheet laid over the page */
  }

  .bar {
    z-index: 1;
    position: sticky;
    top: 0;
    left: 0;
    display: flex;
    padding: var(--mat-margin) calc(var(--mat-margin) + 1px + var(--leftover)) 0 calc(var(--mat-margin) + 1px);
    height: var(--bar);
    --mat-right: var(--leftover); /* (see Mat) */
  }
  /* in the middle of the mat's squares under its frame, a pixel less (see Header) */
  .row {
    flex: 1;
    min-width: 0;
    height: calc(var(--bar) - var(--mat-margin) - 1px);
    display: grid;
    grid-template-columns: min-content 1fr auto;
    align-items: center;
    gap: 1rem;
  }

  /* the sliding Zapisz cut off, the buttons' focus ring (2px, 2px out) not */
  .actions {
    overflow: clip;
    overflow-clip-margin: 0.25rem;
    display: flex;
    align-items: center;
    height: var(--bar-button);
  }
  .save-wrapper {
    width: 0;
    height: 100%;
    transition: width 200ms;
  }
  .save-wrapper.visible {
    width: 7.25rem;
  }
  .save-wrapper :global(.bar-button) {
    margin-left: 0.5rem; /* as far from the cancel as the bar's other buttons are apart */
  }

  /* what else can be done with the item, then deleting it */
  .end {
    display: flex;
    gap: 0.5rem;
  }

  /* centred on the buttons, which lie on the line (see Header); narrowed, the title cutting itself short - cut only
     sideways, when even the serial doesn't fit (not drawn under the buttons; its accents keep their room) */
  .title {
    min-width: 0;
    overflow-x: clip;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    height: var(--bar-button);
  }
  .title .icon {
    flex: none;
    background-color: var(--paper);
    box-shadow: inset 0 0 0 1px var(--black-10);
    border-radius: 50%;
    padding: 0.4rem;
    height: var(--bar-button);
    aspect-ratio: 1 / 1;
  }
  /* both boxes from the capitals' top to the baseline, so the capitals are what's centred (see Header's title) */
  .serial,
  .title h2 {
    line-height: 1;
    text-box: trim-both cap alphabetic;
  }
  .serial {
    flex: none;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    font-variant-numeric: tabular-nums;
    color: var(--red-500);
  }
  /* cut short with an ellipsis: room above and below its capitals, as much on each side, so what it cuts off isn't
     the accents and the tails */
  .title h2 {
    padding-block: 0.3em;
    color: var(--navy-950);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 700;
  }

  /* its own stacking context under the bar: what rises inside it (the API pills) stays under the bar */
  .content {
    position: relative;
    z-index: 0;
    /* the sheet's cutting mat under it, reaching up under the bar, at least as tall as the sheet - both rounded down
       to whole half cells, the rest past the mat's frame (see Mat, the admin layout's page) */
    --mat-inset: calc(-1 * var(--bar)) var(--leftover) 0 0;
    min-height: calc(round(down, 100% - var(--bar) - var(--mat-margin) - 1px, var(--half)) + var(--mat-margin) + 1px);
    padding: 0 calc(var(--mat-margin) + 1px + var(--leftover)) calc(var(--mat-margin) + 1px) var(--mat-margin);
  }

  /* a phone: full width (the phone's back closes it); the bar one line, its row scrolled sideways to its buttons (the
     mat and the perforation staying put), the title cut short so they're in reach */
  @media (max-width: 50rem) {
    .container {
      width: 100%;
    }
    .bar {
      padding: var(--mat-margin) 0 0;
      --mat-left: var(--lead);
      --mat-right: calc(var(--leftover) - var(--lead));
    }
    .row {
      display: flex;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      gap: 0.75rem;
      padding: 0 calc(var(--mat-margin) + 1px + var(--leftover) - var(--lead)) 0
        calc(var(--mat-margin) + 1px + var(--lead)); /* (as the sheet's boxes) */
    }
    .content {
      --mat-inset: calc(-1 * var(--bar)) calc(var(--leftover) - var(--lead)) 0 var(--lead);
      padding: 0 calc(var(--mat-margin) + 1px + var(--leftover) - var(--lead)) calc(var(--mat-margin) + 1px)
        calc(var(--mat-margin) + var(--lead));
    }
    .row > * {
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
  }
</style>
