<script>
  import Badge from './Badge.svelte';

  export let show = true;
</script>

{#if show}
  <Badge label="Bestseller" bg="var(--bestseller)" />
{/if}
