<script>
  import Tooltip from '$c/Tooltip.svelte';

  export let label;
  export let amount;

  export let show = null;
</script>

<Tooltip backgroundColor="var(--light)" border="1px solid rgba(0,0,0,0.5)" {show}>
  <b>{label}</b><br />
  Dostępność:
  {#if amount === null}
    <b><small>ZAPYTAJ</small></b>
  {:else if amount === 0}
    <b><small style="color:var(--main);">BRAK</small></b>
  {:else}
    <b>{amount}</b>
  {/if}
</Tooltip>
