<script>
  import Badge from './Badge.svelte';

  export let show = true;
</script>

{#if show}
  <Badge icon="eye_off" label="Wyłączony" border="1px solid var(--main)" color="var(--main)" />
{/if}
