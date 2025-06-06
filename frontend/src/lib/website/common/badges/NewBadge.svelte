<script>
  import Badge from './Badge.svelte';

  export let show = true;
</script>

{#if show}
  <Badge label="Nowość" bg="var(--new)" />
{/if}
