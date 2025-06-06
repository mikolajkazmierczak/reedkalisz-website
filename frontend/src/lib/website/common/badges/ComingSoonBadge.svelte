<script>
  import Badge from './Badge.svelte';

  export let show = true;
</script>

{#if show}
  <Badge label="Już wkrótce" bg="var(--coming-soon)" />
{/if}
