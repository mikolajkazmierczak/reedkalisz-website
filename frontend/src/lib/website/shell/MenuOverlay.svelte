<script>
  import { tick } from 'svelte';
  import RailContent from './RailContent.svelte';

  export let open = false;
  export let sideMenu = [];

  let overlay;
  let closeBtn;
  let wasOpen = false;

  $: if (typeof document !== 'undefined' && open !== wasOpen) {
    wasOpen = open;
    open ? onOpen() : onClose();
  }

  // Modal: the page behind goes inert, focus moves in, and returns to the Menu button on close.
  function behind() {
    const sheet = document.querySelector('.sheet');
    const rest = sheet ? [...sheet.children].filter((el) => el !== overlay) : [];
    return [...rest, ...document.querySelectorAll('.skip-link')];
  }
  async function onOpen() {
    document.body.style.overflow = 'hidden';
    await tick();
    for (const el of behind()) el.inert = true;
    closeBtn?.focus();
    overlay?.querySelector('.item.exact')?.scrollIntoView({ block: 'center' });
  }
  function onClose() {
    document.body.style.overflow = '';
    for (const el of behind()) el.inert = false;
    document.querySelector('.mbar .menu-btn')?.focus({ preventScroll: true });
  }

  function onKeydown(e) {
    if (e.key === 'Escape' && open) open = false;
  }
</script>

<svelte:window on:keydown={onKeydown} />

<!-- The desktop rail, full screen; branches expand in place. -->
{#if open}
  <div class="overlay rail-frame" role="dialog" aria-modal="true" aria-label="Menu" bind:this={overlay}>
    <RailContent items={sideMenu} expandable>
      <!-- Same position and size as the bar's Menu button. -->
      <button
        slot="aside"
        class="close"
        type="button"
        aria-label="Zamknij menu"
        bind:this={closeBtn}
        on:click={() => (open = false)}>
        Menu
        <svg viewBox="0 0 20 16" fill="none" aria-hidden="true">
          <path d="M4 1l12 14M16 1L4 15" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
    </RailContent>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    height: 100dvh;
    background-color: var(--bg);
  }

  /* The row matches the phone bar, so the logo and Menu don't move. Kontakt's arrow hides when short. */
  .overlay :global(.rail__contact) {
    padding: 0 var(--gutter) var(--sp-3);
  }
  .overlay :global(.rail__contact .brand-row) {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    height: var(--topbar-h);
    margin-bottom: 0;
    container-type: inline-size;
  }
  /* Reset the rail's ordering. */
  .overlay :global(.rail__contact .brand) {
    order: 0;
    align-self: center;
    margin: 0 auto 0 0;
  }
  .overlay :global(.rail__contact .brand img) {
    height: 2.375rem;
  }
  .overlay :global(.rail__contact .kontakt) {
    order: 0;
    flex: none;
    gap: var(--sp-2);
    width: auto;
    min-height: 2.25rem;
    margin-top: 0;
  }
  @container (max-width: 19.5rem) {
    .overlay :global(.rail__contact .kontakt svg) {
      display: none;
    }
  }

  .overlay :global(.rail__contact .reach) {
    display: flex;
    justify-content: space-between;
    gap: var(--sp-4);
  }
  .overlay :global(.rail__contact .reach p) {
    display: flex;
    flex-direction: column;
    margin: 0;
  }
  .overlay :global(.rail__contact .reach__visit) {
    align-items: flex-end;
    text-align: right;
  }
  .overlay :global(.rail__contact .reach a),
  .overlay :global(.rail__contact .reach__visit span) {
    padding-block: 0.1875rem;
  }
  .overlay :global(.rail__contact .sep) {
    display: none;
  }
  .overlay :global(.rail__search),
  .overlay :global(.rail__nav) {
    padding-inline: var(--gutter);
  }

  /* Same metrics as the bar's Menu button. */
  .close {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
    min-height: 2.25rem;
    padding: 0 var(--sp-4);
    border: 2px solid #fff;
    border-radius: var(--r-pill);
    corner-shape: squircle;
    background: none;
    color: #fff;
    font-size: var(--fs-sm);
    font-weight: 700;
    cursor: pointer;
    transition:
      background-color var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease);
  }
  .close:hover {
    background-color: #fff;
    color: var(--navy);
  }
  .close svg {
    width: 1rem;
    height: 0.8125rem;
  }
</style>
