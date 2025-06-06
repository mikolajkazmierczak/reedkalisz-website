<script>
  import Badge from './Badge.svelte';

  export let show = true;
</script>

{#if show}
  <Badge label="Koniec nakładu" bg="var(--out-of-stock)" />
{/if}
