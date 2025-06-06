<script>
  import Badge from './Badge.svelte';

  export let show = true;
</script>

{#if show}
  <Badge icon="sale" label="Promocja" bg="var(--sale)" />
{/if}
