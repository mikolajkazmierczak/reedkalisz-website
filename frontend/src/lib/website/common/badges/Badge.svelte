<script>
  import Icon from '$c/Icon.svelte';

  export let border = false;
  export let light = false;

  export let bgcolor = 'rgb(250, 250, 250)';
  export let color = light ? 'var(--light)' : 'rgb(0, 0, 0)';

  export let icon;
  export let label;
</script>

<div class="badge" class:border style:background-color={bgcolor} style:color>
  {#if icon}
    <div class="icon"><Icon name={icon} strokeWidth="1" {light} /></div>
  {/if}
  {label}
</div>

<style>
  .badge {
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    border-radius: 10px;
    padding: 0.15rem 0.75rem;
    background-color: var(--main-1);
    font-size: 1rem;
    font-weight: bold;
    text-transform: uppercase;
  }
  .badge.border {
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  .icon {
    display: flex;
    align-items: center;
    width: 1.1rem;
    margin-right: 0.5rem;
  }
</style>
