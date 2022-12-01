<script>
  import Input from '@c/Input.svelte';

  export let x;
  export let y;
</script>

<div class="labeling-field">
  <h4>Pole znakowania <small>mm</small></h4>
  <div>
    <Input type="number" step="1" min="0" bind:value={x} placeholder="w" />
    x
    <Input type="number" step="1" min="0" bind:value={y} placeholder="h" />
  </div>
</div>

<style>
  .labeling-field {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .labeling-field div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 50%;
  }
  .labeling-field h4 {
    font-weight: normal;
    margin-bottom: 0.25rem;
  }
</style>
