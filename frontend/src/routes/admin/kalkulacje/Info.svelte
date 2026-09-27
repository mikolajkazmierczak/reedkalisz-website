<script>
  import { fly } from 'svelte/transition';

  // How prices are worked out: the formula over the page (opened from the header, closed by a click).
  export let open = false;
</script>

{#if open}
  <button class="formula" on:click={() => (open = false)} transition:fly={{ y: -30, duration: 200 }}>
    <img src="/imgs/price_formula.svg" alt="price formula" />
  </button>
{/if}

<style>
  .formula {
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: zoom-out;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(0.3125rem);
  }
  .formula img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: block;
    max-width: 100%;
    max-height: 100%;
    width: 80%;
    height: 80%;
  }

  /* a phone: readable, scrolled sideways (a drag doesn't close it, a tap does) */
  @media (max-width: 50rem) {
    .formula {
      overflow: auto;
      display: flex;
      align-items: center;
      padding: 1rem;
    }
    .formula img {
      position: static;
      transform: none;
      flex: none;
      width: 56.25rem;
      height: auto;
      max-width: none;
      max-height: none;
    }
  }
</style>
