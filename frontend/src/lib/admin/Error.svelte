<script>
  import { errors } from '@/stores';
  import Modal from '@c/Modal.svelte';

  function hide() {
    show = false;
  }

  $: show = $errors.length > 0;
</script>

{#if show}
  <!-- over the popups and the login (1000-1001), under the dialogs (1500) -->
  <Modal layer={1002} maxWidth="60ch" tone="error" title="Wystąpił nieoczekiwany błąd" on:close={hide}>
    <p class="muted">Każdemu może się zdarzyć...</p>
    {#each $errors as error}
      <pre>{JSON.stringify(error, null, 4)}</pre>
    {/each}
  </Modal>
{/if}

<style>
  p {
    margin: 0;
  }
  .muted {
    color: var(--grey-500);
  }
  /* each error a box of its own */
  pre {
    margin: 0;
    padding: 0.75rem;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    border-radius: var(--border-radius);
    corner-shape: squircle;
    background-color: var(--grey-100);
  }
</style>
