<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '@c/Button.svelte';
  import Modal from '@c/Modal.svelte';

  // A titled Modal with a close button (a click beside it closes it too)
  const dispatch = createEventDispatcher();

  export let title;
  export let opened;
  export let maxWidth = '32rem';

  function close() {
    opened = false;
    dispatch('close');
  }
</script>

{#if opened}
  <Modal {maxWidth} on:close={close}>
    <div class="close">
      <Button icon="close" title="Zamknij" on:click={close} square />
    </div>
    <h3>{title}</h3>
    <slot />
  </Modal>
{/if}

<style>
  h3 {
    margin: 0;
  }
  .close {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
  }
</style>
