<script>
  import { fly } from 'svelte/transition';
</script>

<div
  class="wrapper"
  in:fly={{ delay: 400, y: 50, duration: 300 }}
  out:fly={{ y: 50, duration: 300 }}
>
  <slot />
</div>

<style>
  .wrapper {
    z-index: 0;
    padding-top: 6.75rem;
    padding-left: 5.5rem;
    width: calc(100% - 1.5rem);
  }
</style>
