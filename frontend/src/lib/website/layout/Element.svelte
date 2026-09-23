<script>
  import { createEventDispatcher } from 'svelte';

  import { editing } from '#/layout/store';
  import Button from '#/layout/Button.svelte';
  import ElementLabel from '#/layout/ElementLabel.svelte';

  const dispatch = createEventDispatcher();

  export let element;

  export let types;
  export let type;

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
      <div class="controls">
        <Button icon="arrow_up" onclick={() => handleMove('up')} />
        <Button icon="arrow_down" onclick={() => handleMove('down')} />
        <div class:greyscale={element.hide}>
          <Button icon={element.hide ? 'eye_off' : 'eye'} onclick={() => (element.hide = !element.hide)} />
        </div>
        <Button icon="delete" bold onclick={handleDelete} />
      </div>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
{:else if !element.hide}
  <div class="el" data-type={type}>
    <slot />
  </div>
{/if}

<style>
  /* The type class lets the page set spacing between blocks. */
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
    flex-direction: column;
    align-items: flex-start;
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
