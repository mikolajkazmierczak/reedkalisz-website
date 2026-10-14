<script>
  import { page } from '$app/stores';
  import MenuOverlay from './MenuOverlay.svelte';
  import { business, tel } from '#/seo';

  export let sideMenu = [];

  let open = false;

  // Close on any navigation, including query-only changes.
  $: ($page.url.href, (open = false));
</script>

<div class="mbar">
  <div class="wrap mbar__inner">
    <a class="logo" href="/" aria-label="REED Kalisz, strona główna">
      <img src="/logo.svg" alt="REED" width="139" height="48" />
    </a>
    <!-- the phone a tap away, not behind the menu -->
    <a class="call" href={tel} aria-label="Zadzwoń: {business.telephone}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path
          d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
          stroke-linejoin="round" />
      </svg>
      Zadzwoń
    </a>
    <button class="menu-btn" type="button" aria-expanded={open} on:click={() => (open = true)}>
      Menu
      <svg viewBox="0 0 20 16" fill="none" aria-hidden="true">
        <path d="M0 1h20M0 8h20M0 15h14" stroke="currentColor" stroke-width="2" />
      </svg>
    </button>
  </div>
</div>

<MenuOverlay bind:open {sideMenu} />

<style>
  .mbar {
    position: sticky;
    top: 0;
    z-index: 60;
    border-bottom: var(--rule);
    background-color: rgba(253, 253, 252, 0.65);
    -webkit-backdrop-filter: blur(0.75rem);
    backdrop-filter: blur(0.75rem);
  }
  .mbar__inner {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    height: var(--topbar-h);
  }
  .logo {
    margin-inline-end: auto;
  }
  .call,
  .menu-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
    min-height: 2.25rem;
    padding: 0 var(--sp-4);
    border: 2px solid var(--ink);
    border-radius: var(--r-pill);
    corner-shape: squircle;
    font-size: var(--fs-sm);
    font-weight: 700;
  }
  /* contact, so the orange; the menu stays ink */
  .call {
    border-color: var(--orange);
    color: var(--orange-deep);
    -webkit-user-select: none;
    user-select: none;
  }
  .call:hover {
    background-color: var(--orange);
    color: #fff;
  }
  .call svg {
    width: 1rem;
    height: 1rem;
  }
  .logo img {
    width: auto;
    height: 2.375rem;
  }
  .menu-btn {
    background-color: transparent;
    color: var(--ink);
    cursor: pointer;
  }
  .menu-btn:hover {
    background-color: var(--ink);
    color: #fff;
  }
  .menu-btn svg {
    width: 1rem;
    height: 0.8125rem;
  }
  /* very small phones: the call's word without its icon, and on the smallest the buttons narrower, so the bar fits */
  @media (max-width: 23.9375rem) {
    .call svg {
      display: none;
    }
  }
  @media (max-width: 21.25rem) {
    .call,
    .menu-btn {
      padding-inline: var(--sp-3);
    }
  }

  @media (min-width: 61.25rem) {
    .mbar {
      display: none;
    }
  }
</style>
