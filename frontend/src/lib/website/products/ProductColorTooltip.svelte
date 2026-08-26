<script>
  import Tooltip from '$c/Tooltip.svelte';
  import { parseAmount, AMOUNT, NONE } from '$/storage';

  export let label;
  export let amount;
  export let available = false;

  export let show = null;

  $: state = parseAmount({ available, amount });
</script>

<Tooltip backgroundColor="var(--light)" border="1px solid rgba(0,0,0,0.5)" {show}>
  <b>{label}</b><br />
  Dostępność:
  {#if state.state === AMOUNT}
    <b>{state.label}</b>
  {:else}
    <b><small class:empty={state.state === NONE}>{state.label}</small></b>
  {/if}
</Tooltip>

<style>
  .empty {
    color: var(--main);
  }
</style>
