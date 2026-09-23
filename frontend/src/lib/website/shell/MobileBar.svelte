<script>
  import { page } from '$app/stores';
  import MenuOverlay from './MenuOverlay.svelte';

  export let sideMenu = [];

  let open = false;

  // Homepage: the bar starts clear over the hero and fills in over the first RAMP px of scroll.
  const RAMP = 160;
  let y = 0;
  $: home = $page.url.pathname === '/';
  $: solid = Math.min(1, Math.max(0, y / RAMP));
  // Close on any navigation, including query-only changes.
  $: ($page.url.href, (open = false));
</script>

<svelte:window bind:scrollY={y} />

<div class="mbar island" class:home style:--solid={home ? solid.toFixed(3) : 1}>
  <div class="wrap mbar__inner">
    <a class="logo" href="/" aria-label="REED Kalisz — strona główna">
      <img src="/logo.svg" alt="REED" width="139" height="48" />
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
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
  }
  /* Phone homepage only, where the hero rises into the bar. */
  @media (max-width: 47.4988rem) {
    .mbar.home {
      border-bottom-color: rgba(17, 17, 16, var(--solid));
      background-color: rgba(253, 253, 252, calc(0.65 * var(--solid)));
      -webkit-backdrop-filter: blur(calc(12px * var(--solid)));
      backdrop-filter: blur(calc(12px * var(--solid)));
    }
    .mbar.home .menu-btn {
      background-color: var(--paper);
    }
  }
  .mbar__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-4);
    height: var(--topbar-h);
  }
  .logo img {
    width: auto;
    height: 2.375rem;
  }
  .menu-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
    min-height: 2.25rem;
    padding: 0 var(--sp-4);
    border: 2px solid var(--ink);
    border-radius: var(--r-pill);
    corner-shape: squircle;
    background-color: transparent;
    color: var(--ink);
    font-size: var(--fs-sm);
    font-weight: 700;
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

  @media (min-width: 61.25rem) {
    .mbar {
      display: none;
    }
  }
</style>
