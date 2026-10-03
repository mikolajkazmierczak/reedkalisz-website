<script>
  // A margin's switch between the global one (its values in a pill beside it: blue while it's the one in use) and its
  // own, set in the fields under it
  export let text; // what it's on: "produkt", "całość", "znakowanie"
  export let globalMargin;
  export let globalMinimum;
  export let globalEnabled;
  export let margin;
  export let minimum;

  import Input from '@c/Input.svelte';
</script>

<Input type="checkbox" bind:value={globalEnabled}>
  Marża na <b>{text}</b>
  <span class="values" class:on={globalEnabled}
    >{globalMargin ?? 0}% · <small>min</small> {globalMinimum ?? 0}&nbsp;zł</span>
</Input>
{#if !globalEnabled}
  <div class="ui-box ui-box--optional">
    <div class="ui-pair">
      <Input type="number" min={0} step={0.01} bind:value={margin}>
        Marża <small>%</small>
      </Input>
      <Input type="number" min={0} step={0.01} bind:value={minimum}>
        Minimum <small>zł</small>
      </Input>
    </div>
  </div>
{/if}

<style>
  /* on the middle of the label's capitals (\`middle\` alone: of its small letters, a pixel low) */
  .values {
    position: relative;
    top: -0.08em;
    display: inline-block;
    vertical-align: middle;
    margin-left: 0.4em;
    padding: 0.1rem 0.55rem;
    border-radius: 1rem;
    font-size: 0.875em;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    color: var(--grey-500);
    background-color: var(--grey-100);
    transition:
      color 100ms,
      background-color 100ms;
  }
  .values.on {
    color: var(--blue-700);
    background-color: var(--blue-100);
  }
  .values small {
    color: inherit; /* (the admin gives every element its own) */
  }
</style>
