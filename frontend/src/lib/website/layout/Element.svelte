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
  $: label = types.find(l => l.type === type).label;
  $: icon = types.find(l => l.type === type).icon;

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
    <div class="side left" class:greyscale>
      <ElementLabel {label} {icon} />
    </div>
    <div class="side right" class:greyscale>
      <div>
        <Button icon="delete" bold onclick={handleDelete} />
        <div class:greyscale={element.hide}>
          <Button icon={element.hide ? 'eye_off' : 'eye'} onclick={() => (element.hide = !element.hide)} />
        </div>
      </div>
      <div>
        <Button icon="arrow_up" onclick={() => handleMove('up')} />
        <Button icon="arrow_down" onclick={() => handleMove('down')} />
      </div>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
{:else if !element.hide}
  <slot />
{/if}

<style>
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

  .side {
    z-index: 1;
    position: absolute;
    top: -2px;
    display: flex;
  }
  .left {
    left: -1rem;
    transform: translate(-100%, 0);
  }
  .right {
    right: -1rem;
    gap: 0.25rem;
    transform: translate(100%, 0);
  }
  .right > div {
    display: flex;
    flex-direction: column;
  }

  .content {
    z-index: 0;
  }
</style>
