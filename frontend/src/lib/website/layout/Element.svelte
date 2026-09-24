<script>
  import { createEventDispatcher } from 'svelte';

  import { editing } from '#/layout/store';
  import Button from '#/layout/Button.svelte';
  import ElementLabel from '#/layout/ElementLabel.svelte';

  const dispatch = createEventDispatcher();

  export let element;

  export let types;
  export let type;
  export let fixed = false; // label only: can't be moved, hidden or deleted
  export let bleed = false; // full width

  $: type = element.type;
  $: label = types.find((l) => l.type === type).label;
  $: icon = types.find((l) => l.type === type).icon;

  $: greyscale = !!element.hide;

  function handleDelete() {
    if (confirm('Na pewno usunąć ten element?')) {
      dispatch('delete');
    }
  }

  function handleMove(direction) {
    dispatch('move', { direction });
  }
</script>

{#if $editing}
  <div class="wrapper" class:grey={greyscale}>
    <!-- Label and controls sit inside the frame: sections are full width, so outside would clip. -->
    <div class="bar" class:greyscale>
      <ElementLabel {label} {icon} />
      {#if !fixed}
        <div class="controls">
          <Button icon="arrow_up" onclick={() => handleMove('up')} />
          <Button icon="arrow_down" onclick={() => handleMove('down')} />
          <div class:greyscale={element.hide}>
            <Button icon={element.hide ? 'eye_off' : 'eye'} onclick={() => (element.hide = !element.hide)} />
          </div>
          <Button icon="delete" bold onclick={handleDelete} />
        </div>
      {/if}
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
{:else if !element.hide}
  <div class="el" data-type={type} data-fixed={fixed || null} data-bleed={bleed || null}>
    <slot />
  </div>
{/if}

<style>
  /* The data attributes let the page set widths, rules and spacing between blocks. */
  .el {
    width: 100%;
  }

  .wrapper {
    position: relative;
    border: 2px solid var(--main-2);
    width: 100%;
  }
  .wrapper.grey {
    border-color: #a5a5a5;
  }
  .greyscale {
    filter: grayscale(1);
  }

  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    padding-block: 0.5rem;
  }
  .controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .content {
    z-index: 0;
  }
</style>
