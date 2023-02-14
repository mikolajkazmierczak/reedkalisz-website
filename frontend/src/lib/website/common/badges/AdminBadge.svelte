<script>
  import Badge from './Badge.svelte';

  export let enabled;
</script>

{#if !enabled}
  <Badge border icon="eye_off" label="Tylko admin" />
{/if}
