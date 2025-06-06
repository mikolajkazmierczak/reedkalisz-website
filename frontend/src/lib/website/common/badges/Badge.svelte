<script>
  import Icon from '$c/Icon.svelte';

  export let icon = null;
  export let label;

  export let light = false;

  export let bg = 'rgb(250, 250, 250)';
  export let color = light ? 'var(--light)' : 'rgb(0, 0, 0)';
  export let border = 'none';
</script>

<div class="badge" style:background-color={bg} style:color style:border>
  {#if icon}
    <Icon name={icon} width="1.05rem" {color} />
  {/if}
  {label}
</div>

<style>
  .badge {
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    border-radius: 10px;
    padding: 0.1rem 0.75rem;
    background-color: var(--main-1);
    font-size: 0.85rem;
    font-weight: normal;
    text-transform: uppercase;
  }
</style>
