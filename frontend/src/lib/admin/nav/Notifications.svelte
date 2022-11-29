<script>
  import { fly } from 'svelte/transition';

  export let show = false;
</script>

{#if show}
  <div class="wrapper" transition:fly={{ y: 10, duration: 200 }}>Cicho tu... zbyt cicho</div>
{/if}

<style>
  .wrapper {
    position: fixed;
    bottom: 1.5rem;
    left: 5.5rem;
    display: flex;
    justify-content: center;
    border: var(--border);
    padding: 1rem;
    width: 30ch;
    background-color: var(--light);
  }
</style>
