<script>
  import { tick } from 'svelte';
  import { dialogs } from '@/dialog';
  import Button from '@c/Button.svelte';
  import Modal from '@c/Modal.svelte';

  // Shows the dialogs of `ask` and `tell` (see dialog.js), the oldest first. Enter presses the focused answer - the
  // safe one when the other can't be undone - and Escape answers no. Like the browser's own dialogs, Tab stays on
  // the answers, and the focus goes back where it was after the last one.
  $: dialog = $dialogs[0];

  let panel;
  let opener = null; // focused before the first dialog
  let focused = null; // the dialog its answer was focused for: one queued behind it doesn't move the focus
  $: if (dialog && dialog !== focused) focus(dialog);
  async function focus(d) {
    focused = d;
    if (!opener) opener = document.activeElement;
    await tick();
    const safe = d.danger && d.cancel;
    panel?.querySelector(`.answer:${safe ? 'first' : 'last'}-child button`)?.focus();
  }

  function answer(yes) {
    if (!dialog) return; // a second click while it fades out
    dialog.resolve(yes);
    $dialogs = $dialogs.slice(1);
    if ($dialogs.length) return;
    opener?.focus();
    opener = null;
  }

  function keydown(e) {
    if (!dialog) return;
    if (e.key === 'Tab') {
      const buttons = [...panel.querySelectorAll('button')];
      const i = buttons.indexOf(document.activeElement) + (e.shiftKey ? -1 : 1);
      buttons[(i + buttons.length) % buttons.length]?.focus();
      e.preventDefault();
      return;
    }
    if (e.key !== 'Escape') return;
    answer(false);
    e.preventDefault();
    e.stopPropagation();
  }
</script>

<svelte:window on:keydown|capture={keydown} />

{#if dialog}
  <!-- layer 1500: over popups, the login and errors (1000-1003), under tooltips (2000) -->
  <Modal
    layer={1500}
    maxWidth="28rem"
    danger={dialog.danger}
    role="alertdialog"
    aria-modal="true"
    aria-labelledby={dialog.title ? 'dialog-title' : undefined}
    aria-describedby="dialog-message"
    bind:panel>
    <div class="text">
      {#if dialog.title}<h3 id="dialog-title">{dialog.title}</h3>{/if}
      <p id="dialog-message">{dialog.message}</p>
    </div>
    <div class="actions">
      {#if dialog.cancel}
        <span class="answer"><Button secondary on:click={() => answer(false)}>{dialog.cancel}</Button></span>
      {/if}
      <span class="answer">
        <!-- the bin for deleting only, not for every danger (leaving, undoing, a failure) -->
        <Button
          dangerous={dialog.danger}
          icon={dialog.danger && dialog.ok.startsWith('Usuń') ? 'delete' : 'ok'}
          on:click={() => answer(true)}>
          {dialog.ok}
        </Button>
      </span>
    </div>
  </Modal>
{/if}

<style>
  .text {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  h3 {
    margin: 0;
  }
  p {
    margin: 0;
    white-space: pre-line; /* the messages break their lines with \n */
    overflow-wrap: anywhere; /* long lists of codes and urls */
    max-height: 60vh;
    overflow-y: auto;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
</style>
