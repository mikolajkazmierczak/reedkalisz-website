<script>
  import { fly } from 'svelte/transition';
  import Button from '@c/Button.svelte';

  let info = false;
  const toggle = () => (info = !info);
</script>

<Button icon="info" on:click={toggle}>Jak wyliczane są ceny?</Button>

{#if info}
  <button class="info" on:click={toggle} transition:fly={{ y: -30, duration: 200 }}>
    <img src="/imgs/price_formula.svg" alt="price formula" />
  </button>
{/if}

<style>
  .info {
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: zoom-out;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
  }
  .info img {
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
</style>
