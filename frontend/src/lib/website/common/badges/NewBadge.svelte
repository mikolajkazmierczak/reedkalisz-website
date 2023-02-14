<script>
  import Badge from './Badge.svelte';

  export let isNew;
</script>

{#if isNew}
  <Badge bgcolor="var(--new)" label="Nowość" />
{/if}
