<script>
  export let text;
  export let globalMargin;
  export let globalMinimum;
  export let globalEnabled;
  export let margin;
  export let minimum;

  import Input from '@c/Input.svelte';
</script>

<Input type="checkbox" bind:value={globalEnabled}>
  Odgórna marża <b>{text}</b> ({globalMargin ?? 0}%, <small>min</small>
  {globalMinimum ?? 0}zł)
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
