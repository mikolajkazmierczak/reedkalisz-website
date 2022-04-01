<script>
  import { me, logout } from '$lib/auth';
  import { fly } from 'svelte/transition';

  export let show = false;
</script>

{#if show}
  <div class="card" transition:fly={{ y: 10 }}>
    <h2>{$me.first_name} {$me.last_name}</h2>
    <!-- <button on:click={logout}>Wyloguj</button> -->
  </div>
{/if}

<style>
  .card {
    position: fixed;
    left: 4.75rem;
    bottom: 0.75rem;
    padding: 1.5rem;
    border: solid 2px var(--grey-light);
    background-color: var(--light);
  }
  h2 {
    font-size: 1.25rem;
  }
</style>
