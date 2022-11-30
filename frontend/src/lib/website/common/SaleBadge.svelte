<script>
  import Badge from '#c/Badge.svelte';

  export let sale;
</script>

{#if sale}
  <Badge bgcolor="var(--sale)" icon="sale" label="Promocja" />
{/if}
