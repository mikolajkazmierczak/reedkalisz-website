<script>
  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';

  // An icon in a table head, for a column of buttons (deleting, the tree), with what the column is for.
  export let icon;
  export let label;
</script>

<span class="head-icon">
  <Tooltip><small>{label}</small></Tooltip>
  <Icon name={icon} height="1.125rem" color="currentColor" />
</span>

<style>
  .head-icon {
    cursor: help;
    position: relative;
    display: flex;
    justify-content: center;
  }
</style>
