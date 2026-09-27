<script>
  import Input from '@c/Input.svelte';

  export let x;
  export let y;
  export let place;
  export let api = false; // the API scanner sets all three: locked, with its pill
</script>

<!-- one label over both size fields -->
<div class="labeling-field">
  <div>
    <span class="ui-label">Pole znakowania <small>mm</small></span>
    <div class="size">
      <Input
        type="number"
        step="1"
        min="0"
        bind:value={x}
        placeholder="w"
        label="Szerokość pola znakowania (mm)"
        {api}
        disabled={api} />
      x
      <Input
        type="number"
        step="1"
        min="0"
        bind:value={y}
        placeholder="h"
        label="Wysokość pola znakowania (mm)"
        {api}
        disabled={api} />
    </div>
  </div>
  <Input bind:value={place} {api} disabled={api}>Miejsce znakowania</Input>
</div>

<style>
  .labeling-field {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .size {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .size > :global(*) {
    flex: 1; /* the two sides as wide, the "x" between them */
  }
</style>
