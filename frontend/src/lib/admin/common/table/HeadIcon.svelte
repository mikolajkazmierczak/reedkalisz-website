<script>
  import Icon from '$c/Icon.svelte';
  import Tooltip from '$c/Tooltip.svelte';

  // An icon in a table head, for a column of buttons (deleting, the tree), with what the column is for.
  export let icon;
  export let label; // (a line break: "\n")
</script>

<span class="head-icon">
  <Tooltip
    ><small
      >{#each label.split('\n') as line, i}{#if i}<br />{/if}{line}{/each}</small
    ></Tooltip>
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
